package entities

import (
	"time"

	"gorm.io/gorm"
)

type BoardStatus struct {
	gorm.Model
	BoardID string `json:"boardId"`
	UserID  int    `json:"userId"`
	Status  string `json:"status"`
	LastSeen time.Time `json:"lastSeen"`
	User	User `gorm:"foreignKey:UserID"`
}