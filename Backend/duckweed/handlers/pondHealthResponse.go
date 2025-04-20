package handlers

import (
	"github.com/gofiber/fiber/v2"
	"gorm.io/gorm"
	"main/duckweed/entities"
)

func CreatePondHealth(db *gorm.DB) fiber.Handler {
	return func(c *fiber.Ctx) error {
		dto := new(entities.InsertPondHealthDto)
		if err := c.BodyParser(dto); err != nil {
			return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": err.Error()})
		}

		pond := entities.PondHealth{
			UserID:  &dto.UserID,
			Picture: &dto.Picture,
			Result:  &dto.Result,
			Data:    &dto.Data,
		}

		if err := db.Create(&pond).Error; err != nil {
			return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": err.Error()})
		}

		return c.Status(fiber.StatusCreated).JSON(pond)
	}
}


func GetAllPondHealth(db *gorm.DB) fiber.Handler {
	return func(c *fiber.Ctx) error {
		var ponds []entities.PondHealth
		if err := db.Preload("User").Find(&ponds).Error; err != nil {
			return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": err.Error()})
		}
		return c.JSON(ponds)
	}
}

func GetPondHealthByID(db *gorm.DB) fiber.Handler {
	return func(c *fiber.Ctx) error {
		id := c.Params("id")
		var pond entities.PondHealth
		if err := db.Preload("User").First(&pond, id).Error; err != nil {
			return c.Status(fiber.StatusNotFound).JSON(fiber.Map{"error": "PondHealth not found"})
		}
		return c.JSON(pond)
	}
}
