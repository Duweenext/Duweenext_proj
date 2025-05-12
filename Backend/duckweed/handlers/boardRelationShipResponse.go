package handlers

import (
	"main/duckweed/entities" // Adjust import path
	"main/duckweed/usecases" // Adjust import path
	"time"

	"github.com/go-playground/validator/v10" // For DTO validation
	"github.com/gofiber/fiber/v2"
	// "log" // For logging errors
)

type BoardRelationshipHandler struct {
	useCase   usecases.BoardRelationshipUseCaseInterface
	validator *validator.Validate // Add validator
}

// NewBoardRelationshipHandler creates a new instance of BoardRelationshipHandler.
func NewBoardRelationshipHandler(uc usecases.BoardRelationshipUseCaseInterface) *BoardRelationshipHandler {
	return &BoardRelationshipHandler{
		useCase:   uc,
		validator: validator.New(), // Initialize validator
	}
}

// CreateManualBoardRelationship is the Fiber handler for the "Manual Way".
func (h *BoardRelationshipHandler) CreateManualBoardRelationship(c *fiber.Ctx) error {
	dto := new(entities.InsertBoardRelationshipDto)

	if err := c.BodyParser(dto); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"status": "error", "message": "Invalid request body", "data": err.Error()})
	}

	// Validate DTO
	if err := h.validator.Struct(dto); err != nil {
		// log.Printf("Validation errors: %v\n", err) // Example logging
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"status": "error", "message": "Validation failed", "data": err.Error()})
	}


	// Default BoardRegisterDate if not provided
	if dto.BoardRegisterDate.IsZero() {
		dto.BoardRegisterDate = time.Now()
	}


	response, err := h.useCase.CreateManualBoardRelationship(*dto)
	if err != nil {
		// log.Printf("Error creating manual board relationship: %v\n", err) // Example logging
		// You might want to check error type here to return different status codes
		// e.g., if err is a known "already exists" error, return fiber.StatusConflict
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"status": "error", "message": "Could not create board relationship", "data": err.Error()})
	}

	return c.Status(fiber.StatusCreated).JSON(fiber.Map{"status": "success", "message": "Board relationship created successfully", "data": response})
}

// CreateBLEBoardRelationship is the Fiber handler for the "BLE Way".
func (h *BoardRelationshipHandler) CreateBLEBoardRelationship(c *fiber.Ctx) error {
	dto := new(entities.InsertBoardRelationshipDto) // Assuming BLE uses the same DTO for now

	if err := c.BodyParser(dto); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"status": "error", "message": "Invalid request body", "data": err.Error()})
	}

	// Validate DTO
	if err := h.validator.Struct(dto); err != nil {
		// log.Printf("Validation errors (BLE): %v\n", err) // Example logging
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"status": "error", "message": "Validation failed", "data": err.Error()})
	}
	
	// Default BoardRegisterDate if not provided
	if dto.BoardRegisterDate.IsZero() {
		dto.BoardRegisterDate = time.Now()
	}


	response, err := h.useCase.CreateBLEBoardRelationship(*dto)
	if err != nil {
		// log.Printf("Error creating BLE board relationship: %v\n", err) // Example logging
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"status": "error", "message": "Could not create board relationship via BLE", "data": err.Error()})
	}

	return c.Status(fiber.StatusCreated).JSON(fiber.Map{"status": "success", "message": "Board relationship created successfully via BLE", "data": response})
}