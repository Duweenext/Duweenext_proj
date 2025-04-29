package repositories

import (
	"gorm.io/gorm"
	"main/duckweed/entities"
)

type EducationRepository struct {
	db *gorm.DB
}

func NewEducationRepository(db *gorm.DB) *EducationRepository {
	return &EducationRepository{db}
}

func (r *EducationRepository) FindAll() ([]entities.Education, error) {
	var edu []entities.Education
	err := r.db.Find(&edu).Error
	return edu, err
}

func (r *EducationRepository) FindByID(id uint) (*entities.Education, error) {
	var edu entities.Education
	err := r.db.First(&edu, id).Error
	return &edu, err
}

