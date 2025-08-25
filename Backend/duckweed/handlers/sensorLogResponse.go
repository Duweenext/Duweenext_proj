package handlers

import (
	"main/duckweed/usecases"

	"github.com/gofiber/fiber/v2"
)

type SensorLogHandler struct {
	useCase usecases.SensorLogUseCaseInterface
}

func NewSensorLogHandler(uc usecases.SensorLogUseCaseInterface) *SensorLogHandler {
	return &SensorLogHandler{
		useCase: uc,
	}
}

func (h *SensorLogHandler) GetSensorData(c *fiber.Ctx) error {
	boardID := c.Params("board_id")
	sensorType := c.Params("sensor_type")
	// Parse "days" as an integer instead of a string
	days, err := c.ParamsInt("days")
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"status":  "error",
			"message": "Invalid days parameter; must be an integer.",
		})
	}

	// Pass the integer 'days' to the use case
	logs, err := h.useCase.GetSensorLogsByBoardID(boardID, days, sensorType)
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"status":  "error",
			"message": err.Error(),
		})
	}

	return c.Status(fiber.StatusOK).JSON(fiber.Map{
		"status":  "success",
		"message": "Sensor data retrieved successfully.",
		"data":    logs,
	})
}