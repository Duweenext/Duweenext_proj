package usecases

import (
	"errors" // Added missing import
	"fmt"    // Added missing import
	"main/duckweed/entities"
	"main/duckweed/repositories"
)

type SensorUseCaseInterface interface {
	CreateSensor(dto entities.InsertSensorDto) (*entities.SensorResponseDto, error)
	GetAllSensors() ([]entities.SensorResponseDto, error)
	GetSensorByID(id uint) (*entities.SensorResponseDto, error)
	GetSensorByBoardID(boardID string) ([]entities.SensorResponseDto, error)
	UpdateSensorThresholds(boardStringID string, dto entities.UpdateSensorThresholdDto) (*entities.SensorResponseDto, error)
}

type SensorUseCase struct {
	sensorRepo repositories.SensorRepositoryInterface
	boardRepo  repositories.BoardRepositoryInterface
}

func NewSensorUseCase(sensorRepo repositories.SensorRepositoryInterface, boardRepo repositories.BoardRepositoryInterface) SensorUseCaseInterface {
	return &SensorUseCase{
		sensorRepo: sensorRepo,
		boardRepo:  boardRepo,
	}
}

// Maps the database entity to a response DTO
func toSensorResponseDto(sensor entities.Sensor) entities.SensorResponseDto {
	return entities.SensorResponseDto{
		ID:                 sensor.ID,
		SensorType:         sensor.SensorType,
		SensorThresholdMax: sensor.SensorThresholdMax,
		SensorThresholdMin: sensor.SensorThresholdMin,
		BoardID:            sensor.BoardID,
		CreatedAt:          sensor.CreatedAt,
		UpdatedAt:          sensor.UpdatedAt,
	}
}

func (uc *SensorUseCase) GetSensorByBoardID(boardID string) ([]entities.SensorResponseDto, error) {
	board, err := uc.boardRepo.FindByBoardID(boardID)
	if err != nil || board == nil {
		return nil, err
	}
	sensors, err := uc.sensorRepo.FindSensorByBoardID(board.ID)
	if err != nil {
		return nil, err
	}

	var responseDtos []entities.SensorResponseDto
	for _, sensor := range sensors {
		responseDtos = append(responseDtos, toSensorResponseDto(sensor))
	}
	return responseDtos, nil
}

func (uc *SensorUseCase) CreateSensor(dto entities.InsertSensorDto) (*entities.SensorResponseDto, error) {
	sensorEntity := &entities.Sensor{
		SensorType:         dto.SensorType,
		SensorThresholdMax: dto.SensorThresholdMax,
		SensorThresholdMin: dto.SensorThresholdMin,
		BoardID:            dto.BoardID,
	}

	// Corrected: Changed uc.repo to uc.sensorRepo
	createdSensor, err := uc.sensorRepo.Create(sensorEntity)
	if err != nil {
		return nil, err
	}

	response := toSensorResponseDto(*createdSensor)
	return &response, nil
}

func (uc *SensorUseCase) GetAllSensors() ([]entities.SensorResponseDto, error) {
	// Corrected: Changed uc.repo to uc.sensorRepo
	sensors, err := uc.sensorRepo.FindAll()
	if err != nil {
		return nil, err
	}

	var responseDtos []entities.SensorResponseDto
	for _, sensor := range sensors {
		responseDtos = append(responseDtos, toSensorResponseDto(sensor))
	}
	return responseDtos, nil
}

func (uc *SensorUseCase) GetSensorByID(id uint) (*entities.SensorResponseDto, error) {
	// Corrected: Changed uc.repo to uc.sensorRepo
	sensor, err := uc.sensorRepo.FindByID(id)
	if err != nil {
		return nil, err
	}
	if sensor == nil {
		return nil, nil // Not found
	}

	response := toSensorResponseDto(*sensor)
	return &response, nil
}
func (uc *SensorUseCase) UpdateSensorThresholds(boardStringID string, dto entities.UpdateSensorThresholdDto) (*entities.SensorResponseDto, error) {
	// Find the board by its public string ID to get its numeric ID
	board, err := uc.boardRepo.FindByBoardID(boardStringID)
	if err != nil {
		return nil, fmt.Errorf("error finding board: %w", err)
	}
	if board == nil {
		return nil, errors.New("board not found")
	}

	// Find the specific sensor for this board
	sensor, err := uc.sensorRepo.FindByBoardIDAndType(board.ID, dto.SensorType)
	if err != nil {
		return nil, fmt.Errorf("error finding sensor for board: %w", err)
	}
	if sensor == nil {
		return nil, fmt.Errorf("sensor of type '%s' not found for board '%s'", dto.SensorType, boardStringID)
	}

	// Update the thresholds and save
	sensor.SensorThresholdMin = dto.SensorThresholdMin
	sensor.SensorThresholdMax = dto.SensorThresholdMax

	updatedSensor, err := uc.sensorRepo.Update(sensor)
	if err != nil {
		return nil, fmt.Errorf("could not update sensor: %w", err)
	}

	response := toSensorResponseDto(*updatedSensor)
	return &response, nil
}
