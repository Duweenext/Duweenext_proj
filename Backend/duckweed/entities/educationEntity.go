package entities

import (
	"time"

	"gorm.io/gorm"
)

type (
	InsertEducationDto struct {
		PostTitle  string
		PostDetail string
		ImageURL   string
		Quote      string
	}
	
	// Education represents the education entity.
	Education struct {
		CreatedAt time.Time
		UpdatedAt time.Time
		DeletedAt gorm.DeletedAt `gorm:"index"`
		PostID     *uint `gorm:"primaryKey;autoIncrement"`
		PostTitle  *string
		PostDetail *string
		ImageURL   *string
		Quote      *string
	}

	EducationResponseDto struct {
		PostID     int64
		PostTitle  string
		PostDetail string
		ImageURL   string
		Quote      string
	}
)