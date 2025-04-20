package handlers

import (
	"github.com/gofiber/fiber/v2"
	"gorm.io/gorm"
	"main/duckweed/entities"
)

func CreateEducation(db *gorm.DB) fiber.Handler {
	return func(c *fiber.Ctx) error {
		dto := new(entities.InsertEducationDto)
		if err := c.BodyParser(dto); err != nil {
			return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": err.Error()})
		}

		edu := entities.Education{
			PostTitle:  &dto.PostTitle,
			PostDetail: &dto.PostDetail,
			ImageURL:   &dto.ImageURL,
			Quote:      &dto.Quote,
		}

		if err := db.Create(&edu).Error; err != nil {
			return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": err.Error()})
		}

		return c.Status(fiber.StatusCreated).JSON(edu)
	}
}

func GetAllEducation(db *gorm.DB) fiber.Handler {
	return func(c *fiber.Ctx) error {
		var edu []entities.Education
		if err := db.Find(&edu).Error; err != nil {
			return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": err.Error()})
		}
		return c.JSON(edu)
	}
}

func GetEducationByID(db *gorm.DB) fiber.Handler {
	return func(c *fiber.Ctx) error {
		id := c.Params("id")
		var post entities.Education
		if err := db.First(&post, id).Error; err != nil {
			return c.Status(fiber.StatusNotFound).JSON(fiber.Map{"error": "Post not found"})
		}
		return c.JSON(post)
	}
}
