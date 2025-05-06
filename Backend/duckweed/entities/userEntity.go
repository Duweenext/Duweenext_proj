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
	UserID      *uint `gorm:"primaryKey;autoIncrement"`
	UserName    *string
	Email       *string
	PhoneNumber *string
	Password    *string
	CreatedAt   *time.Time
	UpdatedAt   *time.Time
	DeletedAt   *gorm.DeletedAt
}

