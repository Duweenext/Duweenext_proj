package entities

import (
	"time"

	"gorm.io/gorm"
)

type Sensor struct {
	CreatedAt time.Time
	UpdatedAt time.Time
	DeletedAt gorm.DeletedAt `gorm:"index"`
	SensorID        *uint `gorm:"primaryKey;autoIncrement"`
	SensorName      *string
	SensorType      *string
	SensorStatus    *string
	SensorThreshold *float64
	SensorFrequency *int64
}

type InsertSensorDto struct {
	SensorName      string  `json:"sensor_name"`
	SensorType      string  `json:"sensor_type"`
	SensorStatus    string  `json:"sensor_status"`
	SensorThreshold float64 `json:"sensor_threshold"`
	SensorFrequency int64   `json:"sensor_frequency"`
}

type SensorResponseDto struct {
	SensorID        uint    `json:"sensor_id"`
	SensorName      string  `json:"sensor_name"`
	SensorType      string  `json:"sensor_type"`
	SensorStatus    string  `json:"sensor_status"`
	SensorThreshold float64 `json:"sensor_threshold"`
	SensorFrequency int64   `json:"sensor_frequency"`
}