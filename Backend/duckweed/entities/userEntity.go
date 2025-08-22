package entities

import (
	"time"

	"gorm.io/gorm"
)

type AuthenticateUserDto struct {
	UserName string `json:"username"`
	Email    string `json:"email"`
	Password string `json:"password"`
}

type InsertUserDto struct {
	UserName    string
	Email       string
	PhoneNumber string
	Password    string
}

type UserResponseDto struct {
	UserID      int64
	UserName    string
	Email       string
	PhoneNumber string
}

type User struct {
	CreatedAt       time.Time
	UpdatedAt       time.Time
	DeletedAt       gorm.DeletedAt `gorm:"index"`
	UserID          *uint          `gorm:"primaryKey;autoIncrement"`
	UserName        *string
	Email           *string
	PhoneNumber     *string
	Password        *string
	EmailVerifiedAt *time.Time
}

type EmailVerificationCode struct {
	ID          uint `gorm:"type:uuid;primaryKey"`
	UserID      uint `gorm:"type:uuid;index"`
	CodeHash    string
	SentAt      time.Time
	ExpiresAt   time.Time
	Attempts    int
	MaxAttempts int
}
