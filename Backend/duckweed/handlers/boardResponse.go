package handlers

import (
	"github.com/gofiber/fiber/v2"
	"gorm.io/gorm"
	"main/duckweed/entities"
)

func CreateBoard(db *gorm.DB) fiber.Handler {
	return func(c *fiber.Ctx) error {
		dto := new(entities.InsertBoardDto)
		if err := c.BodyParser(dto); err != nil {
			return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": err.Error()})
		}

		board := entities.Board{
			SensorID:          &dto.SensorID,
			BoardName:         &dto.BoardName,
			BoardRegisterDate: &dto.BoardRegisterDate,
			BoardStatus:       &dto.BoardStatus,
		}

		if err := db.Create(&board).Error; err != nil {
			return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": err.Error()})
		}

		return c.Status(fiber.StatusCreated).JSON(board)
	}
}


func GetAllBoards(db *gorm.DB) fiber.Handler {
	return func(c *fiber.Ctx) error {
		var boards []entities.Board
		if err := db.Preload("Sensors").Find(&boards).Error; err != nil {
			return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": err.Error()})
		}
		return c.JSON(boards)
	}
}

func GetBoardByID(db *gorm.DB) fiber.Handler {
	return func(c *fiber.Ctx) error {
		id := c.Params("id")
		var board entities.Board
		if err := db.Preload("Sensors").First(&board, id).Error; err != nil {
			return c.Status(fiber.StatusNotFound).JSON(fiber.Map{"error": "Board not found"})
		}
		return c.JSON(board)
	}
}
