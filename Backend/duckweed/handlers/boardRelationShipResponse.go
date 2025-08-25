package handlers

import (
	"log"
	"main/duckweed/entities"
	"main/duckweed/usecases"
	"strconv"

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

func (h *BoardRelationshipHandler) GetRelationshipsByUserID(c *fiber.Ctx) error {
	userIDStr := c.Params("userID")
	userID, err := strconv.ParseUint(userIDStr, 10, 32)
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"status":  "error",
			"message": "Invalid User ID format.",
			"data":    err.Error(),
		})
	}

	log.Printf("[DEBUG-HANDLER] Handling GetRelationshipsByUserID for UserID: %d\n", userID)

	relationships, err := h.useCase.GetRelationshipsByUserID(uint(userID))
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"status":  "error",
			"message": "Could not retrieve board relationships.",
			"data":    err.Error(),
		})
	}

	if len(relationships) == 0 {
		return c.Status(fiber.StatusOK).JSON(fiber.Map{
			"status":  "success",
			"message": "No board relationships found for this user.",
			"data":    []interface{}{},
		})
	}

	return c.Status(fiber.StatusOK).JSON(fiber.Map{
		"status":  "success",
		"message": "Board relationships retrieved successfully.",
		"data":    relationships,
	})
}

func (h *BoardRelationshipHandler) UpdateBoardRelationshipStatus(c *fiber.Ctx) error {
	idStr := c.Params("id")
	id, err := strconv.ParseUint(idStr, 10, 32)
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"status":  "error",
			"message": "Invalid relationship ID format.",
			"data":    err.Error(),
		})
	}

	dto := new(entities.UpdateBoardRelationshipStatusDto)
	if err := c.BodyParser(dto); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"status":  "error",
			"message": "Invalid request body.",
			"data":    err.Error(),
		})
	}

	if err := h.validator.Struct(dto); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"status":  "error",
			"message": "Validation failed: 'con_status' is required and must be 'active', 'inactive', or 'disabled'.",
			"data":    err.Error(),
		})
	}

	updatedRelationship, err := h.useCase.UpdateBoardRelationshipStatus(uint(id), *dto)
	if err != nil {
		if err.Error() == "board relationship not found" {
			return c.Status(fiber.StatusNotFound).JSON(fiber.Map{
				"status":  "error",
				"message": err.Error(),
				"data":    nil,
			})
		}
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"status":  "error",
			"message": "Could not update board relationship.",
			"data":    err.Error(),
		})
	}

	return c.Status(fiber.StatusOK).JSON(fiber.Map{
		"status":  "success",
		"message": "Board relationship status updated successfully.",
		"data":    updatedRelationship,
	})
}