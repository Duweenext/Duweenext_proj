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