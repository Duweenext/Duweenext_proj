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
	BoardID           string           `gorm:"unique;not null"`
	BoardName         *string
	BoardStatus       *BoardStatusEnum `gorm:"type:varchar(20);check:board_status IN ('active','inactive','disabled')"`
	BoardRegisterDate *time.Time
	LastSeen          *time.Time 
	RunTime           *time.Time
}

type InsertBoardDto struct {
	BoardID   string  `json:"board_id" validate:"required"`
	BoardName *string `json:"board_name"`
}

type BoardResponseDto struct {
	ID                uint             `json:"id"`       
	BoardID           string           `json:"board_id"` 
	BoardName         *string          `json:"board_name"`
	BoardRegisterDate *time.Time       `json:"board_register_date"`
	BoardStatus       *BoardStatusEnum `json:"board_status"`
	LastSeen          *time.Time       `json:"last_seen"`
	RunTime           *time.Time       `json:"run_time"`
}