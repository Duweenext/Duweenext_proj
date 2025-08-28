package usecases

import (
	"errors"
	"fmt"
	"log"
	"main/duckweed/entities"
	"main/duckweed/repositories"

	"golang.org/x/crypto/bcrypt"
)

type BoardRelationshipUseCaseInterface interface {
	CreateBoardRelationship(dto entities.InsertBoardRelationshipDto) (*entities.BoardRelationshipResponseDto, error)
	GetRelationshipsByUserID(userID uint) ([]entities.BoardRelationshipResponseDto, error)
	UpdateBoardRelationshipStatus(id uint, dto entities.UpdateBoardRelationshipStatusDto) (*entities.BoardRelationshipResponseDto, error)
}

type BoardRelationshipUseCase struct {
	boardRepo             repositories.BoardRepositoryInterface
	boardRelationshipRepo repositories.BoardRelationshipRepositoryInterface
	sensorRepo            repositories.SensorRepositoryInterface // Added
}

func NewBoardRelationshipUseCase(
	boardRepo repositories.BoardRepositoryInterface,
	boardRelationshipRepo repositories.BoardRelationshipRepositoryInterface,
	sensorRepo repositories.SensorRepositoryInterface, // Added
) BoardRelationshipUseCaseInterface {
	return &BoardRelationshipUseCase{
		boardRepo:             boardRepo,
		boardRelationshipRepo: boardRelationshipRepo,
		sensorRepo:            sensorRepo, // Added
	}
}

func (uc *BoardRelationshipUseCase) ensureAllSensorsExist(boardID uint) error {
	// Use the corrected SensorType and constant names
	requiredSensors := []entities.SensorType{
		entities.SensorTypePH,
		entities.SensorTypeEC,
		entities.SensorTypeTemperature,
	}

	existingSensors, err := uc.sensorRepo.FindByBoardID(boardID)
	if err != nil {
		return fmt.Errorf("failed to find existing sensors: %w", err)
	}

	// Use the corrected SensorType for the map key
	existingSensorTypes := make(map[entities.SensorType]bool)
	for _, sensor := range existingSensors {
		existingSensorTypes[sensor.SensorType] = true
	}

	for _, requiredType := range requiredSensors {
		if !existingSensorTypes[requiredType] {
			// Create a new sensor matching the updated struct
			newSensor := &entities.Sensor{
				BoardID:    boardID,
				SensorType: requiredType,
			}
			if _, err := uc.sensorRepo.Create(newSensor); err != nil {
				return fmt.Errorf("failed to create sensor of type %s: %w", requiredType, err)
			}
			log.Printf("[INFO-USECASE] Created missing sensor '%s' for board ID %d", requiredType, boardID)
		}
	}

	return nil
}

func (uc *BoardRelationshipUseCase) CreateBoardRelationship(dto entities.InsertBoardRelationshipDto) (*entities.BoardRelationshipResponseDto, error) {
	switch dto.ConMethod {
	case entities.ConMethodManual, entities.ConMethodBluetooth:
	default:
		return nil, errors.New("invalid connection method specified")
	}

	board, err := uc.boardRepo.FindByBoardID(dto.BoardID)
	if err != nil {
		return nil, fmt.Errorf("error checking for existing board: %w", err)
	}

	if board == nil {
		var hashedPassword *string
		if dto.ConPassword != nil && *dto.ConPassword != "" {
			bytes, err := bcrypt.GenerateFromPassword([]byte(*dto.ConPassword), 14)
			if err != nil {
				return nil, fmt.Errorf("failed to hash password: %w", err)
			}
			pass := string(bytes)
			hashedPassword = &pass
		}

		newBoard := &entities.Board{
			BoardID:     dto.BoardID,
			BoardName:   dto.BoardName,
			ConPassword: hashedPassword,
		}
		board, err = uc.boardRepo.Create(newBoard)
		if err != nil {
			return nil, fmt.Errorf("failed to create new board: %w", err)
		}
	} else {
		if board.ConPassword != nil && *board.ConPassword != "" {
			if dto.ConPassword == nil || *dto.ConPassword == "" {
				return nil, errors.New("password is required for this board")
			}
			err := bcrypt.CompareHashAndPassword([]byte(*board.ConPassword), []byte(*dto.ConPassword))
			if err != nil {
				return nil, errors.New("invalid password")
			}
		}
	}

	// THIS IS THE CRITICAL DEBUGGING LINE
	log.Printf("[DEBUG-USECASE] Board check complete. Numeric ID to be used for sensors is: %d", board.ID)

	if err := uc.ensureAllSensorsExist(board.ID); err != nil {
		log.Printf("[WARN-USECASE] Could not ensure all sensors for board ID %d: %v", board.ID, err)
	}

	existingRel, err := uc.boardRelationshipRepo.FindByBoardIDAndUserID(board.BoardID, dto.UserID)
	if err != nil {
		return nil, fmt.Errorf("error checking for existing relationship: %w", err)
	}
	if existingRel != nil {
		return nil, errors.New("a relationship for this user and board already exists")
	}

	relationship := &entities.BoardRelationship{
		UserID:    dto.UserID,
		BoardID:   board.BoardID,
		ConMethod: dto.ConMethod,
		ConStatus: entities.ConStatusActive,
	}

	createdRelationship, err := uc.boardRelationshipRepo.Create(relationship)
	if err != nil {
		return nil, fmt.Errorf("could not create board relationship: %w", err)
	}

	responseDto := &entities.BoardRelationshipResponseDto{
		UserID:    createdRelationship.UserID,
		BoardID:   createdRelationship.BoardID,
		BoardName: board.BoardName,
		ConStatus: createdRelationship.ConStatus,
		ConMethod: createdRelationship.ConMethod,
		CreatedAt: createdRelationship.CreatedAt,
		UpdatedAt: createdRelationship.UpdatedAt,
	}
	return responseDto, nil
}

func (uc *BoardRelationshipUseCase) GetRelationshipsByUserID(userID uint) ([]entities.BoardRelationshipResponseDto, error) {
	log.Printf("[DEBUG-USECASE] Fetching relationships for UserID: %d\n", userID)
	relationships, err := uc.boardRelationshipRepo.FindByUserID(userID)
	if err != nil {
		log.Printf("[ERROR-USECASE] Error fetching relationships from repo for UserID %d: %v\n", userID, err)
		return nil, fmt.Errorf("error retrieving relationships: %w", err)
	}

	log.Printf("[DEBUG-USECASE] Found %d relationships for UserID: %d\n", len(relationships), userID)

	var responseDtos []entities.BoardRelationshipResponseDto
	for _, rel := range relationships {
		board, err := uc.boardRepo.FindByBoardID(rel.BoardID)
		if err != nil {
			log.Printf("[ERROR-USECASE] Could not find board with BoardID %s for UserID %d: %v\n", rel.BoardID, userID, err)
			continue
		}

		var boardName *string
		var boardFrequency *float64
		if board != nil && board.BoardName != nil {
			boardName = board.BoardName
			boardFrequency = board.SensorFrequency
		}

		responseDtos = append(responseDtos, entities.BoardRelationshipResponseDto{
			ID:             rel.ID,
			UserID:         rel.UserID,
			BoardID:        rel.BoardID,
			BoardName:      boardName,
			ConStatus:      rel.ConStatus,
			ConMethod:      rel.ConMethod,
			CreatedAt:      rel.CreatedAt,
			UpdatedAt:      rel.UpdatedAt,
			BoardFrequency: boardFrequency,
		})
	}

	log.Printf("[DEBUG-USECASE] Successfully prepared %d DTOs for UserID: %d\n", len(responseDtos), userID)
	return responseDtos, nil
}

func (uc *BoardRelationshipUseCase) UpdateBoardRelationshipStatus(id uint, dto entities.UpdateBoardRelationshipStatusDto) (*entities.BoardRelationshipResponseDto, error) {
	relationship, err := uc.boardRelationshipRepo.FindByID(id)
	if err != nil {
		return nil, fmt.Errorf("error finding relationship: %w", err)
	}
	if relationship == nil {
		return nil, errors.New("board relationship not found")
	}

	relationship.ConStatus = dto.ConStatus

	updatedRelationship, err := uc.boardRelationshipRepo.Update(relationship)
	if err != nil {
		return nil, fmt.Errorf("could not update board relationship: %w", err)
	}

	board, err := uc.boardRepo.FindByBoardID(updatedRelationship.BoardID)
	if err != nil {
		log.Printf("[WARN-USECASE] Could not find board with BoardID %s while updating relationship %d: %v\n", updatedRelationship.BoardID, id, err)
	}

	var boardName *string
	if board != nil {
		boardName = board.BoardName
	}

	responseDto := &entities.BoardRelationshipResponseDto{
		ID:        updatedRelationship.ID,
		UserID:    updatedRelationship.UserID,
		BoardID:   updatedRelationship.BoardID,
		BoardName: boardName,
		ConStatus: updatedRelationship.ConStatus,
		ConMethod: updatedRelationship.ConMethod,
		CreatedAt: updatedRelationship.CreatedAt,
		UpdatedAt: updatedRelationship.UpdatedAt,
	}

	return responseDto, nil
}
