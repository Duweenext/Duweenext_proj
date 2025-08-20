package entities

import (
	"time"

	"gorm.io/gorm"
)

type ConStatusEnum string
type ConMethodEnum string

const (
	ConMethodBluetooth ConMethodEnum = "bluetooth"
	ConMethodManual    ConMethodEnum = "manual"
)

const (
	ConStatusActive   ConStatusEnum = "active"
	ConStatusInactive ConStatusEnum = "inactive"
	ConStatusDisabled ConStatusEnum = "disabled"
)

type BoardRelationship struct {
	gorm.Model
	ConStatus ConStatusEnum `gorm:"type:varchar(20);check:con_status IN ('active','inactive','disabled')"`
	ConMethod ConMethodEnum `gorm:"type:varchar(20);check:con_method IN ('bluetooth','manual')"`
	BoardID string `json:"board_id"`
	UserID  uint `json:"user_id"`
	Board Board `gorm:"foreignKey:BoardID"`
	User  User  `gorm:"foreignKey:UserID"`
}

// DTO for inserting a BoardRelationship
type InsertBoardRelationshipDto struct {
	BoardID   string          `json:"board_id"`
	UserID    uint          `json:"user_id"`
	ConMethod ConMethodEnum `json:"con_method"`
	ConPassword *string `json:"con_password"`
	BoardName *string `json:"board_name"`

}

// DTO for responding with BoardRelationship details
type BoardRelationshipResponseDto struct {
	BoardID   string          `json:"board_id"`
	UserID    uint          `json:"user_id"`
	ConStatus ConStatusEnum `json:"con_status"`
	ConMethod ConMethodEnum `json:"con_method"`
	CreatedAt time.Time     `json:"created_at"`
	UpdatedAt time.Time     `json:"updated_at"`
}
