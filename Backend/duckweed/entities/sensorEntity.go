package entities

import (
	"time"

	"gorm.io/gorm"
)

type SensorType string

const (
	SensorTypeEC          SensorType = "EC"
	SensorTypeTemperature SensorType = "Temperature"
	SensorTypePH          SensorType = "pH"
)

type Sensor struct {
	gorm.Model
	SensorType         SensorType `gorm:"type:varchar(20)"`
	SensorThresholdMax *float64
	SensorThresholdMin *float64
	BoardID            uint `gorm:"not null"`
}
type InsertSensorDto struct {
	SensorType         SensorType `json:"sensor_type" validate:"required,oneof=EC Temperature pH"`
	SensorThresholdMax *float64   `json:"sensor_threshold_max"`
	SensorThresholdMin *float64   `json:"sensor_threshold_min"`
	BoardID            uint       `json:"board_id" validate:"required"`
}
type SensorResponseDto struct {
	ID                 uint       `json:"id"`
	SensorType         SensorType `json:"sensor_type"`
	SensorThresholdMax *float64   `json:"sensor_threshold_max"`
	SensorThresholdMin *float64   `json:"sensor_threshold_min"`
	BoardID            uint       `json:"board_id"`
	CreatedAt          time.Time  `json:"created_at"`
	UpdatedAt          time.Time  `json:"updated_at"`
}
type UpdateSensorThresholdDto struct {
	SensorType         SensorType `json:"sensor_type" validate:"required,oneof=EC Temperature pH"`
	SensorThresholdMin *float64   `json:"sensor_threshold_min"`
	SensorThresholdMax *float64   `json:"sensor_threshold_max"`
}
