package usecases

import (
	"main/duckweed/entities"
	"main/duckweed/repositories"
)

type SensorUseCase struct {
	repo repositories.SensorRepository
}

func NewSensorUseCase(repo repositories.SensorRepository) *SensorUseCase {
	return &SensorUseCase{repo}
}

func (uc *SensorUseCase) GetAllSensors() ([]entities.Sensor, error) {
	return uc.repo.FindAll()
}

func (uc *SensorUseCase) GetSensorByID(id uint) (*entities.Sensor, error) {
	return uc.repo.FindByID(id)
}

// func (uc *SensorUseCase) CreateSensor(sensor entities.Sensor) (*entities.Sensor, error) {
// 	// Additional business logic can be applied here before saving the sensor
// 	err := uc.repo.Create(sensor)
// 	return &sensor, err
// }


