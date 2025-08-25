package handlers

import (
	"main/duckweed/entities"
	"main/duckweed/usecases"
	"strconv"

	"github.com/go-playground/validator/v10"
	"github.com/gofiber/fiber/v2"
)

type SensorHandler struct {
	useCase   usecases.SensorUseCaseInterface
	validator *validator.Validate
}

func NewSensorHandler(uc usecases.SensorUseCaseInterface) *SensorHandler {
	return &SensorHandler{
		useCase:   uc,
		validator: validator.New(),
	}
}

func (h *SensorHandler) CreateSensor(c *fiber.Ctx) error {
	dto := new(entities.InsertSensorDto)
	if err := c.BodyParser(dto); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"status": "error", "message": "Invalid request body", "data": err.Error()})
	}

	if err := h.validator.Struct(dto); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"status": "error", "message": "Validation failed", "data": err.Error()})
	}

	sensor, err := h.useCase.CreateSensor(*dto)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"status": "error", "message": "Could not create sensor", "data": err.Error()})
	}

	return c.Status(fiber.StatusCreated).JSON(fiber.Map{"status": "success", "data": sensor})
}

func (h *SensorHandler) GetAllSensors(c *fiber.Ctx) error {
	sensors, err := h.useCase.GetAllSensors()
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"status": "error", "message": "Could not retrieve sensors"})
	}
	return c.Status(fiber.StatusOK).JSON(fiber.Map{"status": "success", "data": sensors})
}

func (h *SensorHandler) GetSensorByID(c *fiber.Ctx) error {
	idStr := c.Params("id")
	id, err := strconv.ParseUint(idStr, 10, 32)
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"status": "error", "message": "Invalid ID format"})
	}

	sensor, err := h.useCase.GetSensorByID(uint(id))
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"status": "error", "message": "Could not retrieve sensor"})
	}
	if sensor == nil {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{"status": "error", "message": "Sensor not found"})
	}

	return c.Status(fiber.StatusOK).JSON(fiber.Map{"status": "success", "data": sensor})
}


func (h *SensorHandler) UpdateSensorThresholds(c *fiber.Ctx) error {
	boardID := c.Params("board_id")
	if boardID == "" {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"status": "error", "message": "Board ID is required in the URL"})
	}

	dto := new(entities.UpdateSensorThresholdDto)
	if err := c.BodyParser(dto); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"status": "error", "message": "Invalid request body", "data": err.Error()})
	}

	if err := h.validator.Struct(dto); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"status": "error", "message": "Validation failed", "data": err.Error()})
	}

	updatedSensor, err := h.useCase.UpdateSensorThresholds(boardID, *dto)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"status": "error", "message": err.Error()})
	}

	return c.Status(fiber.StatusOK).JSON(fiber.Map{"status": "success", "data": updatedSensor})
}