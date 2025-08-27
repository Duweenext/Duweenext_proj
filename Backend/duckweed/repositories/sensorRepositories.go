package repositories

import (
	"main/duckweed/entities"

	"gorm.io/gorm"
)

type SensorRepositoryInterface interface {
	FindByBoardID(boardID uint) ([]entities.Sensor, error)
	Create(sensor *entities.Sensor) (*entities.Sensor, error)
	FindAll() ([]entities.Sensor, error)
	FindByID(id uint) (*entities.Sensor, error)
	FindByBoardIDAndType(boardID uint, sensorType entities.SensorType) (*entities.Sensor, error)
	Update(sensor *entities.Sensor) (*entities.Sensor, error)
	FindSensorByBoardID(boardID uint) ([]entities.Sensor, error)
}

type SensorRepository struct {
	db *gorm.DB
}

func NewSensorRepository(db *gorm.DB) SensorRepositoryInterface {
	return &SensorRepository{db}
}

func (r *SensorRepository) FindByBoardID(boardID uint) ([]entities.Sensor, error) {
	var sensors []entities.Sensor
	err := r.db.Where("board_id = ?", boardID).Find(&sensors).Error
	return sensors, err
}

func (r *SensorRepository) FindSensorByBoardID(boardID uint) ([]entities.Sensor, error) {
	var sensors []entities.Sensor
	err := r.db.Where("board_id = ?", boardID).Find(&sensors).Error
	return sensors, err
}

func (r *SensorRepository) Create(sensor *entities.Sensor) (*entities.Sensor, error) {
	if err := r.db.Create(sensor).Error; err != nil {
		return nil, err
	}
	return sensor, nil
}

// FindAll retrieves all sensors from the database.
func (r *SensorRepository) FindAll() ([]entities.Sensor, error) {
	var sensors []entities.Sensor
	err := r.db.Find(&sensors).Error
	if err != nil {
		return nil, err
	}
	return sensors, nil
}

// FindByID retrieves a single sensor by its primary key.
func (r *SensorRepository) FindByID(id uint) (*entities.Sensor, error) {
	var sensor entities.Sensor
	err := r.db.First(&sensor, id).Error
	if err != nil {
		if err == gorm.ErrRecordNotFound {
			return nil, nil // Return nil if not found
		}
		return nil, err
	}
	return &sensor, nil
}

func (r *SensorRepository) FindByBoardIDAndType(boardID uint, sensorType entities.SensorType) (*entities.Sensor, error) {
	var sensor entities.Sensor
	err := r.db.Where("board_id = ? AND sensor_type = ?", boardID, sensorType).First(&sensor).Error
	if err != nil {
		if err == gorm.ErrRecordNotFound {
			return nil, nil
		}
		return nil, err
	}
	return &sensor, nil
}

func (r *SensorRepository) Update(sensor *entities.Sensor) (*entities.Sensor, error) {
	if err := r.db.Save(sensor).Error; err != nil {
		return nil, err
	}
	return sensor, nil
}
