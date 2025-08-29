package entities

import (
	"time"

	"gorm.io/gorm"
)

type SensorLog struct {
	gorm.Model
	Temperature float64 `gorm:"column:temperature" json:"temperature"`
	Ec          float64 `gorm:"column:ec" json:"ec"`
	Ph          float64 `gorm:"column:ph" json:"ph"`
	BoardID     *string `gorm:"column:board_id" json:"board_id"`
	Board       Board   `gorm:"foreignKey:BoardID"`
}

type InsertSensorLogDto struct {
	BoardID     string  `json:"board_id" validate:"required"`
	Temperature float64 `json:"temperature"`
	Ec          float64 `json:"ec"`
	Ph          float64 `json:"ph"`
}

type SensorLogResponseDto struct {
	ID          uint      `json:"id"`
	BoardID     string    `json:"board_id"`
	Temperature float64   `json:"temperature"`
	Ec          float64   `json:"ec"`
	Ph          float64   `json:"ph"`
	CreatedAt   time.Time `json:"created_at"`
}
