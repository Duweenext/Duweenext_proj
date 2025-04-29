package handlers

import (
	"main/duckweed/entities"
	"main/duckweed/usecases"
	"strconv"

	"github.com/gofiber/fiber/v2"
	"gorm.io/gorm"
)

type EducationHandler struct {
	UseCase usecases.EducationUseCase
}

func NewEducationHandler(useCase usecases.EducationUseCase) *EducationHandler {
	return &EducationHandler{UseCase: useCase}
}



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


func (h *EducationHandler) GetAllEducation(c *fiber.Ctx) error {
		contents, err := h.UseCase.GetAllEducation()
		if err != nil {
			return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": err.Error()})
		}
		return c.JSON(contents)
}

// func (h *PondHealthHandler) GetPondHealthByID(c *fiber.Ctx) error {
// 	idParam := c.Params("id")
// 	id, err := strconv.Atoi(idParam)
// 	if err != nil {
// 		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "invalid ID"})
// 	}
// 	pond, err := h.UseCase.GetPondHealthByID(uint(id))
// 	if err != nil {
// 		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{"error": err.Error()})
// 	}
// 	return c.JSON(pond)
// }

func (h *EducationHandler) GetEducationByID(c *fiber.Ctx) error {
		idParam := c.Params("id")
		id, err := strconv.Atoi(idParam)
		if err != nil {
			return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "invalid ID"})
		}
		content, err := h.UseCase.GetEducationByID(uint(id))
		if err != nil {
			return c.Status(fiber.StatusNotFound).JSON(fiber.Map{"error": err.Error()})
		}
		return c.JSON(content)
}
