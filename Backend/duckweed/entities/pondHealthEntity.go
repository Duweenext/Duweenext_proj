package entities

import (
	"time"
)


type PondHealth struct {
	PondID   *uint     `gorm:"primaryKey;autoIncrement"`
	UserID   *uint     `gorm:"not null"`   
	Picture  *string    
	Result   *string    
	Data     *time.Time 
	User      User      `gorm:"foreignKey:UserID"`
}
