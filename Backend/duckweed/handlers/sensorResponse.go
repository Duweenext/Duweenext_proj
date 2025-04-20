package handlers

import (
	"github.com/gofiber/fiber/v2"
	"gorm.io/gorm"
	"main/duckweed/entities"
)

func CreateSensor(db *gorm.DB) fiber.Handler {
	return func(c *fiber.Ctx) error {
		dto := new(entities.InsertSensorDto)
		if err := c.BodyParser(dto); err != nil {
			return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": err.Error()})
		}

		sensor := entities.Sensor{
			SensorName:      &dto.SensorName,
			SensorType:      &dto.SensorType,
			SensorStatus:    &dto.SensorStatus,
			SensorThreshold: &dto.SensorThreshold,
			SensorFrequency: &dto.SensorFrequency,
		}

		if err := db.Create(&sensor).Error; err != nil {
			return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": err.Error()})
		}

		return c.Status(fiber.StatusCreated).JSON(sensor)
	}
}


func GetAllSensors(db *gorm.DB) fiber.Handler {
	return func(c *fiber.Ctx) error {
		var sensors []entities.Sensor
		if err := db.Find(&sensors).Error; err != nil {
			return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": err.Error()})
		}
		return c.JSON(sensors)
	}
}

func GetSensorByID(db *gorm.DB) fiber.Handler {
	return func(c *fiber.Ctx) error {
		id := c.Params("id")
		var sensor entities.Sensor
		if err := db.First(&sensor, id).Error; err != nil {
			return c.Status(fiber.StatusNotFound).JSON(fiber.Map{"error": "Sensor not found"})
		}
		return c.JSON(sensor)
	}
}
