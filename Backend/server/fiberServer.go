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
	"main/mqtt"

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
	clients map[*websocket.Conn]map[string]bool
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

	// Initialize MQTT client and publisher
	mqtt.Initialize(s.db.GetDb(), s.conf, s)
	mqttPublisher := &mqtt.Publisher{}

	// Repositories
	userRepo := repositories.NewUserRepository(s.db.GetDb())
	pondHealthRepo := repositories.NewPondHealthRepository(s.db.GetDb())
	educationRepo := repositories.NewEducationRepository(s.db.GetDb())
	boardRepo := repositories.NewBoardRepository(s.db.GetDb())
	boardRelationshipRepo := repositories.NewBoardRelationshipRepository(s.db.GetDb())
	sensorLogRepo := repositories.NewSensorLogRepository(s.db.GetDb())
	sensorRepo := repositories.NewSensorRepository(s.db.GetDb())

	// Use cases
	userUseCase := usecases.NewUserUseCase(*userRepo)
	pondHealthUseCase := usecases.NewpondHealthUseCase(*pondHealthRepo)
	educationUseCase := usecases.NewEducationUseCase(*educationRepo)
	boardRelationshipUseCase := usecases.NewBoardRelationshipUseCase(boardRepo, boardRelationshipRepo, sensorRepo)
	boardUseCase := usecases.NewBoardUseCase(boardRepo, mqttPublisher)
	sensorLogUseCase := usecases.NewSensorLogUseCase(sensorLogRepo)
	sensorUseCase := usecases.NewSensorUseCase(sensorRepo, boardRepo)

	// Handlers
	userHandler := handlers.NewUserHandler(userUseCase)
	pondHealthHandler := handlers.NewPondHealthHandler(pondHealthUseCase)
	educationHandler := handlers.NewEducationHandler(educationUseCase)
	boardRelationShipHandler := handlers.NewBoardRelationshipHandler(boardRelationshipUseCase)
	boardHandler := handlers.NewBoardHandler(boardUseCase)
	sensorLogHandler := handlers.NewSensorLogHandler(sensorLogUseCase)
	sensorHandler := handlers.NewSensorHandler(sensorUseCase)

	apivisit := s.app.Group("/visit")
	api := s.app.Group("/v1", jwtMiddleware)

	api.Get("/users", userHandler.GetAllUsers)
	api.Get("/users/:id", userHandler.GetUserByID)
	apivisit.Post("/login", userHandler.Login)
	apivisit.Post("/register", userHandler.Register)

	api.Get("/pondhealth", pondHealthHandler.GetAllPondHealth)
	api.Get("/pondhealth/:id", pondHealthHandler.GetPondHealthByID)
	api.Get("/pondhealthByUserId/:userid", pondHealthHandler.GetPondHealthByUserID)
	api.Post("/PostPondHealth/", pondHealthHandler.PostPondHealth)

	api.Get("/education", educationHandler.GetAllEducation)
	api.Get("/education/:id", educationHandler.GetEducationByID)

	api.Post("/board-relationships", boardRelationShipHandler.CreateBoardRelationship)
	api.Get("/relationships/user/:userID", boardRelationShipHandler.GetRelationshipsByUserID)
	api.Put("/board-relationships/:id", boardRelationShipHandler.UpdateBoardRelationshipStatus)

	api.Get("/board/all", boardHandler.GetAllBoards)
	api.Get("/board/:board_id", boardHandler.GetBoardByBoardID)
	api.Put("/board/frequency/:board_id", boardHandler.UpdateSensorFrequency)
	api.Post("/board/measure/:board_id", boardHandler.TriggerMeasurement)

	api.Get("/sensors", sensorHandler.GetAllSensors)
	api.Post("/sensors", sensorHandler.CreateSensor)
	api.Get("/sensors/:id", sensorHandler.GetSensorByID)
	api.Get("/sensors/board/:board_id", sensorHandler.GetSensorByBoardId)
	api.Put("/sensor/thresholds/:board_id", sensorHandler.UpdateSensorThresholds)
	api.Get("/sensor/:sensor_type/:board_id/:days<int(1..365)>", sensorLogHandler.GetSensorData)
	apivisit.Get("/ws/:userId/:boardId", s.websocketHandler)

	go s.monitorBoardStatus()

	serverUrl := fmt.Sprintf(":%d", s.conf.Server.Port)
	log.Println("Server is starting on", serverUrl)
	log.Fatal(s.app.Listen(serverUrl))
}
