package repositories

import (
	"gorm.io/gorm"
	"main/duckweed/entities"
)

type PondHealthRepository struct {
	db *gorm.DB
}

func NewPondHealthRepository(db *gorm.DB) *PondHealthRepository {
	return &PondHealthRepository{db}
}

func (r *PondHealthRepository) FindAll() ([]entities.PondHealth, error) {
	var ponds []entities.PondHealth
	err := r.db.Preload("User").Find(&ponds).Error
	return ponds, err
}

func (r *PondHealthRepository) FindByID(id uint) (*entities.PondHealth, error) {
	var pond entities.PondHealth
	err := r.db.Preload("User").First(&pond, id).Error
	return &pond, err
}

// GetPondHealthByUserID
func (r *PondHealthRepository) FindByUserID(userID uint) ([]entities.PondHealth, error) {
	var ponds []entities.PondHealth
	err := r.db.Preload("User").Where("user_id = ?", userID).Find(&ponds).Error
	return ponds, err
}
