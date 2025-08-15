package handlers

import (
	"time"

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

		// Set default values for the new board
		now := time.Now()
		activeStatus := entities.BoardStatusActive
		
		board := entities.Board{
			BoardID:           dto.BoardID,
			BoardName:         dto.BoardName,
			BoardRegisterDate: &now,          
			BoardStatus:       &activeStatus, 
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
		if err := db.Find(&boards).Error; err != nil {
			return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": err.Error()})
		}
		return c.JSON(boards)
	}
}

func GetBoardByID(db *gorm.DB) fiber.Handler {
	return func(c *fiber.Ctx) error {
		id := c.Params("id")
		var board entities.Board
		if err := db.First(&board, id).Error; err != nil {
			return c.Status(fiber.StatusNotFound).JSON(fiber.Map{"error": "Board not found"})
		}
		return c.JSON(board)
	}
}
