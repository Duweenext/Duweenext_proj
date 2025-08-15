package handlers

import (
	"main/duckweed/entities"
	"main/duckweed/usecases"

	"github.com/go-playground/validator/v10"
	"github.com/gofiber/fiber/v2"
)

type BoardRelationshipHandler struct {
	useCase   usecases.BoardRelationshipUseCaseInterface
	validator *validator.Validate
}

func NewBoardRelationshipHandler(uc usecases.BoardRelationshipUseCaseInterface) *BoardRelationshipHandler {
	return &BoardRelationshipHandler{
		useCase:   uc,
		validator: validator.New(),
	}
}

func (h *BoardRelationshipHandler) CreateBoardRelationship(c *fiber.Ctx) error {
	dto := new(entities.InsertBoardRelationshipDto)

	if err := c.BodyParser(dto); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"status":  "error",
			"message": "Invalid request body. Please check the data format.",
			"data":    err.Error(),
		})
	}

	if err := h.validator.Struct(dto); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"status":  "error",
			"message": "Validation failed. Required fields are missing or invalid.",
			"data":    err.Error(),
		})
	}

	response, err := h.useCase.CreateBoardRelationship(*dto)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"status":  "error",
			"message": "Could not create board relationship.",
			"data":    err.Error(),
		})
	}

	return c.Status(fiber.StatusCreated).JSON(fiber.Map{
		"status":  "success",
		"message": "Board relationship created successfully.",
		"data":    response,
	})
}
