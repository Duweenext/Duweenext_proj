package server

import (
	"fmt"
	"log"
	"sync"

	"github.com/gofiber/fiber/v2/middleware/cors"

	"main/config"
	"main/database"
	"main/duckweed/handlers"
	"main/duckweed/repositories"
	"main/duckweed/usecases"

	"github.com/gofiber/contrib/websocket"
	"github.com/gofiber/fiber/v2"
	"github.com/gofiber/fiber/v2/middleware/logger"
	"github.com/gofiber/fiber/v2/middleware/recover"

	jwtware "github.com/gofiber/contrib/jwt"
)

type FiberServer struct {
	app     *fiber.App
	db      database.Database
	conf    *config.Config
	clients map[*websocket.Conn]map[string]bool // map to track connected clients
	mutex   sync.Mutex
}

func NewFiberServer(conf *config.Config, db database.Database) Server {
	fiberApp := fiber.New()

	server := &FiberServer{
		app:     fiberApp,
		db:      db,
		conf:    conf,
		clients: make(map[*websocket.Conn]map[string]bool),
		mutex:   sync.Mutex{},
	}

	return server
}

func (s *FiberServer) Start() {
	s.app.Use(recover.New())
	s.app.Use(logger.New())

	s.app.Get("v1/health", func(c *fiber.Ctx) error {
		return c.SendString("OK")
	})

	s.app.Use(cors.New(cors.Config{
		AllowOrigins:     s.conf.Server.AllowOrigins,
		AllowHeaders:     "Origin, Content-Type, Accept, Authorization",
		AllowCredentials: true,
	}))

	jwtSecret := s.conf.Server.JwtSecret
	if jwtSecret == "" {
		log.Fatal("JWT Secret Key not configured!")
	}

	jwtMiddleware := jwtware.New(jwtware.Config{
		SigningKey: jwtware.SigningKey{
			JWTAlg: jwtware.HS256,
			Key:    []byte(jwtSecret),
		},
		ErrorHandler: func(c *fiber.Ctx, err error) error {
			if err.Error() == "Missing or malformed JWT" {
				return c.Status(fiber.StatusBadRequest).
					JSON(fiber.Map{"status": "error", "message": "Missing or malformed JWT", "data": nil})
			} else {
				return c.Status(fiber.StatusUnauthorized).
					JSON(fiber.Map{"status": "error", "message": "Invalid or expired JWT", "data": nil})
			}
		},
		ContextKey: "user",
	})

	// Repositories
	userRepo := repositories.NewUserRepository(s.db.GetDb())
	pondHealthRepo := repositories.NewPondHealthRepository(s.db.GetDb())
	educationRepo := repositories.NewEducationRepository(s.db.GetDb())
	boardRepo := repositories.NewBoardRepository(s.db.GetDb())
	boardRelationshipRepo := repositories.NewBoardRelationshipRepository(s.db.GetDb())

	// Use cases
	userUseCase := usecases.NewUserUseCase(*userRepo)
	pondHealthUseCase := usecases.NewpondHealthUseCase(*pondHealthRepo)
	educationUseCase := usecases.NewEducationUseCase(*educationRepo)
	boardRelationshipUseCase := usecases.NewBoardRelationshipUseCase(boardRepo, boardRelationshipRepo)
	boardUseCase := usecases.NewBoardUseCase(boardRepo)

	// Handlers
	userHandler := handlers.NewUserHandler(userUseCase)
	pondHealthHandler := handlers.NewPondHealthHandler(pondHealthUseCase)
	educationHandler := handlers.NewEducationHandler(educationUseCase)
	boardRelationShipHandler := handlers.NewBoardRelationshipHandler(boardRelationshipUseCase)
	boardHandler := handlers.NewBoardHandler(boardUseCase)


	// Routes
	apivisit := s.app.Group("/visit")
	api := s.app.Group("/v1", jwtMiddleware)

	// User routes
	api.Get("/users", userHandler.GetAllUsers)
	api.Get("/users/:id", userHandler.GetUserByID)
	apivisit.Post("/login", userHandler.Login)
	apivisit.Post("/register", userHandler.Register)

	// PondHealth routes
	api.Get("/pondhealth", pondHealthHandler.GetAllPondHealth)
	api.Get("/pondhealth/:id", pondHealthHandler.GetPondHealthByID)
	api.Get("/pondhealthByUserId/:userid", pondHealthHandler.GetPondHealthByUserID)
	api.Post("/PostPondHealth/", pondHealthHandler.PostPondHealth)

	// Education routes
	api.Get("/education", educationHandler.GetAllEducation)
	api.Get("/education/:id", educationHandler.GetEducationByID)

	// Board Relationship routes
	api.Post("/board-relationships", boardRelationShipHandler.CreateBoardRelationship)

	// Board routes - specific routes first, then parameterized routes
	api.Get("/board/all", boardHandler.GetAllBoards)
	api.Get("/board/:board_id", boardHandler.GetBoardByBoardID)

	// WebSocket Route
	apivisit.Get("/ws/:userId/:boardId", s.websocketHandler)

	// Start background tasks
	go s.monitorBoardStatus()

	// Start server
	serverUrl := fmt.Sprintf(":%d", s.conf.Server.Port)
	log.Fatal(s.app.Listen(serverUrl))
}
