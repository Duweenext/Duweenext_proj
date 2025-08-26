package usecases

import (
	"main/duckweed/entities"
	"main/duckweed/repositories"
	"time"
)

type SensorLogUseCaseInterface interface {
	GetSensorLogsByBoardID(boardID string, days int, sensorType string) ([]entities.SensorLogResponseDto, error)
}

type SensorLogUseCase struct {
	sensorLogRepo repositories.SensorLogRepositoryInterface
}

func NewSensorLogUseCase(sensorLogRepo repositories.SensorLogRepositoryInterface) SensorLogUseCaseInterface {
	return &SensorLogUseCase{
		sensorLogRepo: sensorLogRepo,
	}
}

func (uc *SensorLogUseCase) GetSensorLogsByBoardID(boardID string, days int, sensorType string) ([]entities.SensorLogResponseDto, error) {
	startTime := time.Now().AddDate(0, 0, -days)

	logs, err := uc.sensorLogRepo.FindByBoardIDAndDuration(boardID, startTime)
	if err != nil {
		return nil, err
	}

	var responseDtos []entities.SensorLogResponseDto
	for _, log := range logs {
		dto := entities.SensorLogResponseDto{
			ID:          log.ID,
			BoardID:     *log.BoardID,
			CreatedAt:   log.CreatedAt,
			Temperature: log.Temperature,
			Ec:          log.Ec,
			Ph:          log.Ph,
		}
		responseDtos = append(responseDtos, dto)
	}

	return responseDtos, nil
}