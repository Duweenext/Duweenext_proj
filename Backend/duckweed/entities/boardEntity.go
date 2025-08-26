package entities

import (
	"time"

	"gorm.io/gorm"
)

type BoardStatusEnum string

const (
	BoardStatusActive   BoardStatusEnum = "active"
	BoardStatusInactive BoardStatusEnum = "inactive"
	BoardStatusDisabled BoardStatusEnum = "disabled"
)

type Board struct {
	gorm.Model
	BoardID           string `gorm:"unique;not null"`
	BoardName         *string
	ConPassword       *string          `json:"-"`
	BoardStatus       *BoardStatusEnum `gorm:"type:varchar(20);check:board_status IN ('active','inactive','disabled')"`
	BoardRegisterDate *time.Time
	LastSeen          *time.Time
	RunTime           *time.Time
	SensorFrequency   *float64 `json:"sensor_frequency"` // Changed to float64
	Sensors           []Sensor `gorm:"foreignKey:BoardID;references:ID" json:"sensors,omitempty"`
}

type InsertBoardDto struct {
	BoardID         string   `json:"board_id" validate:"required"`
	BoardName       *string  `json:"board_name"`
	SensorFrequency *float64 `json:"sensor_frequency"` // Changed to float64
}

type UpdateSensorFrequencyDto struct {
	SensorFrequency *float64 `json:"sensor_frequency" validate:"required"`
}

type BoardResponseDto struct {
	ID                uint             `json:"id"`
	BoardID           string           `json:"board_id"`
	BoardName         *string          `json:"board_name"`
	BoardRegisterDate *time.Time       `json:"board_register_date"`
	BoardStatus       *BoardStatusEnum `json:"board_status"`
	LastSeen          *time.Time       `json:"last_seen"`
	RunTime           *time.Time       `json:"run_time"`
	SensorFrequency   *float64         `json:"sensor_frequency"` // Changed to float64
}
