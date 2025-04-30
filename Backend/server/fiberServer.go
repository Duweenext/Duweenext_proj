package server

import (
	"fmt"
	"log"

	"github.com/gofiber/fiber/v2/middleware/cors"

	"main/config"
	"main/database"
	"main/duckweed/handlers"
	"main/duckweed/repositories"
	"main/duckweed/usecases"

	"github.com/gofiber/fiber/v2"
	"github.com/gofiber/fiber/v2/middleware/logger"
	"github.com/gofiber/fiber/v2/middleware/recover"
)

type fiberServer struct {
	app  *fiber.App
	db   database.Database
	conf *config.Config
}

func NewFiberServer(conf *config.Config, db database.Database) Server {
	fiberApp := fiber.New()

	return &fiberServer{
		app:  fiberApp,
		db:   db,
		conf: conf,
	}
}

func (s *fiberServer) Start() {
	s.app.Use(recover.New())
	s.app.Use(logger.New())

	s.app.Get("v1/health", func(c *fiber.Ctx) error {
		return c.SendString("OK")
	})

	s.app.Use(cors.New(cors.Config{
		AllowOrigins:     "http://localhost:8081",
		AllowHeaders:     "Origin, Content-Type, Accept, Authorization",
		AllowCredentials: true,
	}))

	// Repositories
	userRepo := repositories.NewUserRepository(s.db.GetDb())
	// sensorRepo := repositories.NewSensorRepository(s.db.GetDb())
	pondHealthRepo := repositories.NewPondHealthRepository(s.db.GetDb())
	educationRepo := repositories.NewEducationRepository(s.db.GetDb())
	// boardRepo := repositories.NewBoardRepository(s.db.GetDb())

	// Use cases
	userUseCase := usecases.NewUserUseCase(*userRepo)
	// sensorUseCase := usecases.NewSensorUseCase(*sensorRepo)
	pondHealthUseCase := usecases.NewpondHealthUseCase(*pondHealthRepo)
	educationUseCase := usecases.NewEducationUseCase(*educationRepo)
	// boardUseCase := usecases.NewBoardUseCase(*boardRepo)

	// Handlers
	userHandler := handlers.NewUserHandler(userUseCase)
	// sensorHandler := handlers.NewSensorHandler(sensorUseCase)
	pondHealthHandler := handlers.NewPondHealthHandler(pondHealthUseCase)
	educationHandler := handlers.NewEducationHandler(educationUseCase)
	// boardHandler := handlers.NewBoardHandler(boardUseCase)

	// Routes
	api := s.app.Group("/v1")

	// User routes
	// api.Post("/users", userHandler.CreateUser)
	api.Get("/users", userHandler.GetAllUsers)
	api.Get("/users/:id", userHandler.GetUserByID)
	api.Post("/login", userHandler.Login)
	api.Post("/register", userHandler.Register)

	// Sensor routes
	// api.Post("/sensors", sensorHandler.CreateSensor)
	// api.Get("/sensors", sensorHandler.GetAllSensors)
	// api.Get("/sensors/:id", sensorHandler.GetSensorByID)

	// // PondHealth routes
	// api.Post("/pondhealth", pondHealthHandler.CreatePondHealth)
	api.Get("/pondhealth", pondHealthHandler.GetAllPondHealth)
	api.Get("/pondhealth/:id", pondHealthHandler.GetPondHealthByID)
	api.Get("/pondhealthByUserId/:userid", pondHealthHandler.GetPondHealthByUserID)
	api.Post("/PostPondHealth/", pondHealthHandler.PostPondHealth)
	// // Education routes
	// api.Post("/education", educationHandler.CreateEducation)
	api.Get("/education", educationHandler.GetAllEducation)
	api.Get("/education/:id", educationHandler.GetEducationByID)

	// // Board routes
	// api.Post("/boards", boardHandler.CreateBoard)
	// api.Get("/boards", boardHandler.GetAllBoards)
	// api.Get("/boards/:id", boardHandler.GetBoardByID)

	// Start server
	serverUrl := fmt.Sprintf(":%d", s.conf.Server.Port)
	log.Fatal(s.app.Listen(serverUrl))
}
