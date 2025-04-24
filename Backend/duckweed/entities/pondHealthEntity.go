package entities

import (
	"time"
)


type PondHealth struct {
	PondID   *uint     `gorm:"primaryKey;autoIncrement"`
	UserID   *uint     `gorm:"not null"`   
	Picture  *string    
	Result   *string    
	Data     time.Time `json:"data" gorm:"autoCreateTime"`
	User      User      `gorm:"foreignKey:UserID"`
}
type InsertPondHealthDto struct {
	UserID  uint    `json:"user_id"`
	Picture string  `json:"picture"`
	Result  string  `json:"result"`
	Data    time.Time `json:"data" gorm:"autoCreateTime"`
}

type PondHealthResponseDto struct {
	PondID  uint    `json:"pond_id"`
	UserID  uint    `json:"user_id"`
	Picture string  `json:"picture"`
	Result  string  `json:"result"`
}