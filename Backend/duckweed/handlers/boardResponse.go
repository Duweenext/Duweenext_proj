package handlers

import (
	"main/duckweed/entities"
	"main/duckweed/usecases"

	"github.com/go-playground/validator/v10"
	"github.com/gofiber/fiber/v2"
)

type BoardHandler struct {
	useCase   usecases.BoardUseCaseInterface
	validator *validator.Validate
}

func NewBoardHandler(uc usecases.BoardUseCaseInterface) *BoardHandler {
	return &BoardHandler{
		useCase:   uc,
		validator: validator.New(),
	}
}

func (h *BoardHandler) CreateBoard(c *fiber.Ctx) error {
	dto := new(entities.InsertBoardDto)
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
			"message": "Validation failed.",
			"data":    err.Error(),
		})
	}

	board, err := h.useCase.CreateBoard(*dto)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"status":  "error",
			"message": "Could not create board.",
			"data":    err.Error(),
		})
	}

	return c.Status(fiber.StatusCreated).JSON(fiber.Map{
		"status":  "success",
		"message": "Board created successfully.",
		"data":    board,
	})
}

func (h *BoardHandler) GetAllBoards(c *fiber.Ctx) error {
	boards, err := h.useCase.GetAllBoards()
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"status":  "error",
			"message": "Could not retrieve boards.",
			"data":    err.Error(),
		})
	}

	return c.Status(fiber.StatusOK).JSON(fiber.Map{
		"status":  "success",
		"message": "Boards retrieved successfully.",
		"data":    boards,
	})
}

func (h *BoardHandler) GetBoardByBoardID(c *fiber.Ctx) error {
	boardID := c.Params("board_id")
	if boardID == "" {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"status":  "error",
			"message": "Board ID parameter is required.",
		})
	}

	board, err := h.useCase.GetBoardByBoardID(boardID)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"status":  "error",
			"message": "An error occurred while retrieving the board.",
			"data":    err.Error(),
		})
	}

	if board == nil {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{
			"status":  "error",
			"message": "Board not found.",
		})
	}

	return c.Status(fiber.StatusOK).JSON(fiber.Map{
		"status":  "success",
		"message": "Board retrieved successfully.",
		"data":    board,
	})
}

func (h *BoardHandler) UpdateSensorFrequency(c *fiber.Ctx) error {
	boardID := c.Params("board_id")
	var dto entities.UpdateSensorFrequencyDto
	if err := c.BodyParser(&dto); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "Invalid request body"})
	}

	err := h.useCase.UpdateSensorFrequency(boardID, dto)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": err.Error()})
	}
	return c.SendStatus(fiber.StatusNoContent)
}

func (h *BoardHandler) TriggerMeasurement(c *fiber.Ctx) error {
	boardID := c.Params("board_id")
	if boardID == "" {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "Board ID is required"})
	}

	err := h.useCase.TriggerMeasurement(boardID)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": err.Error()})
	}

	return c.Status(fiber.StatusAccepted).JSON(fiber.Map{
		"message": "Measurement command sent successfully. Awaiting data from device.",
	})
}
