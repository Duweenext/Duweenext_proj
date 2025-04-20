package repositories

import (
	"gorm.io/gorm"
	"main/duckweed/entities"
)

type SensorRepository struct {
	db *gorm.DB
}

func NewSensorRepository(db *gorm.DB) *SensorRepository {
	return &SensorRepository{db}
}

func (r *SensorRepository) FindAll() ([]entities.Sensor, error) {
	var sensors []entities.Sensor
	err := r.db.Find(&sensors).Error
	return sensors, err
}

func (r *SensorRepository) FindByID(id uint) (*entities.Sensor, error) {
	var sensor entities.Sensor
	err := r.db.First(&sensor, id).Error
	return &sensor, err
}