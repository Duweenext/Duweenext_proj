package server

import (
	"fmt"
	"log"

	"main/config"
	"main/database"

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

	// Health check adding
	s.app.Get("v1/health", func(c *fiber.Ctx) error {
		return c.SendString("OK")
	})

	serverUrl := fmt.Sprintf(":%d", s.conf.Server.Port)
	log.Fatal(s.app.Listen(serverUrl))
}

