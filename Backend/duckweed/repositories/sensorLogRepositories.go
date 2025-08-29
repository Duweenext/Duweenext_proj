package repositories

import (
	"main/duckweed/entities"
	"time"

	"gorm.io/gorm"
)

type SensorLogRepositoryInterface interface {
	Create(log *entities.SensorLog) (*entities.SensorLog, error)
	FindByBoardIDAndDuration(boardID string, startTime time.Time) ([]entities.SensorLog, error)
}

type SensorLogRepository struct {
	db *gorm.DB
}

func NewSensorLogRepository(db *gorm.DB) SensorLogRepositoryInterface {
	return &SensorLogRepository{db: db}
}

func (r *SensorLogRepository) Create(log *entities.SensorLog) (*entities.SensorLog, error) {
	if err := r.db.Create(log).Error; err != nil {
		return nil, err
	}
	return log, nil
}

func (r *SensorLogRepository) FindByBoardIDAndDuration(boardID string, startTime time.Time) ([]entities.SensorLog, error) {
	var logs []entities.SensorLog
	err := r.db.Where("board_id = ? AND created_at >= ?", boardID, startTime).Find(&logs).Error
	if err != nil {
		return nil, err
	}
	return logs, nil
}
