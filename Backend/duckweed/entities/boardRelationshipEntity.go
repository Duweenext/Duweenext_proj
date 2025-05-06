package entities

import (
	"time"

	"gorm.io/gorm"
)

type BoardRelationship struct {
	CreatedAt time.Time
	UpdatedAt time.Time
	DeletedAt gorm.DeletedAt `gorm:"index"`
	ConnectionID       uint      `gorm:"primaryKey;autoIncrement"`
	BoardID            *string   `gorm:"not null"`
	UserID             *uint     `gorm:"not null"`
	BoardRegisterDate  time.Time
}

type InsertBoardRelationshipDto struct {
	ConnectionID       uint      `json:"connection_id"`
	BoardID            string    `json:"board_id"`
	UserID             *uint     `json:"user_id"`
	BoardRegisterDate  time.Time `json:"board_register_date"`
}

type BoardRelationshipResponseDto struct {
	ConnectionID       uint      `json:"connection_id"`
	BoardID            string    `json:"board_id"`
	SensorID           uint      `json:"sensor_id"`
	BoardRegisterDate  time.Time `json:"board_register_date"`
}
