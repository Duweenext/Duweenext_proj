package entities

import (
	"time"
)

type Board struct {
	BoardID           *uint  `gorm:"primaryKey;autoIncrement"`
	SensorID		  *uint	 `gorm:"not null"`   
	BoardName         *string    
	BoardRegisterDate *time.Time 
	BoardStatus       *string    
	Sensors           Sensor  `gorm:"foreignKey:SensorID"`
}

type InsertBoardDto struct {
	SensorID        uint    `json:"sensor_id"`
	BoardName       string  `json:"board_name"`
	BoardRegisterDate time.Time `json:"board_register_date"`
	BoardStatus     string  `json:"board_status"`
}

type BoardResponseDto struct {
	BoardID         uint    `json:"board_id"`
	SensorID        uint    `json:"sensor_id"`
	BoardName       string  `json:"board_name"`
	BoardRegisterDate time.Time `json:"board_register_date"`
	BoardStatus     string  `json:"board_status"`
}