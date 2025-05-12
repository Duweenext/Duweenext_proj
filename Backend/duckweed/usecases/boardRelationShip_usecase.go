package usecases

import (
	"errors"
	"time"

	"main/duckweed/entities"     // Adjust import path
	"main/duckweed/repositories" // Adjust import path
)

// BoardRelationshipUseCaseInterface defines the contract for board relationship business logic.
type BoardRelationshipUseCaseInterface interface {
	CreateManualBoardRelationship(dto entities.InsertBoardRelationshipDto) (*entities.BoardRelationshipResponseDto, error)
	CreateBLEBoardRelationship(dto entities.InsertBoardRelationshipDto) (*entities.BoardRelationshipResponseDto, error)
	// Add other use case methods as needed
}

type BoardRelationshipUseCase struct {
	repo repositories.BoardRelationshipRepositoryInterface
	// userRepo repositories.UserRepositoryInterface // Example: if you need to validate UserID existence
	// boardRepo repositories.BoardRepositoryInterface // Example: if you need to validate BoardID existence
}

// NewBoardRelationshipUseCase creates a new instance of BoardRelationshipUseCase.
func NewBoardRelationshipUseCase(
	repo repositories.BoardRelationshipRepositoryInterface,
	// userRepo repositories.UserRepositoryInterface,
	// boardRepo repositories.BoardRepositoryInterface,
) BoardRelationshipUseCaseInterface {
	return &BoardRelationshipUseCase{
		repo: repo,
		// userRepo: userRepo,
		// boardRepo: boardRepo,
	}
}

// commonCreateBoardRelationship provides shared logic for creating relationships.
func (uc *BoardRelationshipUseCase) commonCreateBoardRelationship(
	dto entities.InsertBoardRelationshipDto,
	source string, // e.g., "MANUAL" or "BLE"
) (*entities.BoardRelationshipResponseDto, error) {
	// Basic validation (can be enhanced with a validator library)
	if dto.BoardID == "" {
		return nil, errors.New("board_id is required")
	}
	if dto.UserID == nil {
		return nil, errors.New("user_id is required")
	}

	// --- Optional: Validate UserID and BoardID existence ---
	// Example:
	// user, err := uc.userRepo.FindByID(*dto.UserID)
	// if err != nil || user == nil {
	// 	 return nil, errors.New("invalid user_id")
	// }
	// board, err := uc.boardRepo.FindByID(dto.BoardID) // Assuming BoardID in boardRepo.FindByID is string
	// if err != nil || board == nil {
	// 	 return nil, errors.New("invalid board_id")
	// }
	// --- End Optional Validation ---



	registerDate := dto.BoardRegisterDate
	if registerDate.IsZero() { // If client didn't provide a date, default to now
		registerDate = time.Now()
	}

	relationship := &entities.BoardRelationship{
		BoardID:           &dto.BoardID,
		UserID:            dto.UserID,
		BoardRegisterDate: registerDate,
		// Potentially add a field like "Source" or "RegistrationMethod"
		// to distinguish between MANUAL and BLE if needed in the entity itself.
	}

	// Specific logic for BLE if any (e.g. different default values, additional checks)
	if source == "BLE" {
		// Add any BLE-specific logic here
		// For example, BLE registration might have a default shorter expiry, or specific status
	}

	createdRelationship, err := uc.repo.Create(relationship)
	if err != nil {
		return nil, err // Handle specific GORM errors like unique constraint violations if not caught by FindByBoardIDAndUserID
	}

	// Map to Response DTO
	responseDto := &entities.BoardRelationshipResponseDto{
		ConnectionID:      createdRelationship.ConnectionID,
		UserID:            *createdRelationship.UserID,
		BoardID:           *createdRelationship.BoardID,
		BoardRegisterDate: createdRelationship.BoardRegisterDate,
	}

	return responseDto, nil
}

// CreateManualBoardRelationship handles the logic for creating a relationship via the manual method.
func (uc *BoardRelationshipUseCase) CreateManualBoardRelationship(dto entities.InsertBoardRelationshipDto) (*entities.BoardRelationshipResponseDto, error) {
	// Manual-specific pre-processing or validation can go here
	return uc.commonCreateBoardRelationship(dto, "MANUAL")
}

// CreateBLEBoardRelationship handles the logic for creating a relationship via the BLE method.
func (uc *BoardRelationshipUseCase) CreateBLEBoardRelationship(dto entities.InsertBoardRelationshipDto) (*entities.BoardRelationshipResponseDto, error) {
	// BLE-specific pre-processing or validation can go here
	// For example, BLE DTO might have different fields, or require different checks.
	// If DTO for BLE is different, create a new DTO (e.g., InsertBLEBoardRelationshipDto)
	// and a separate method or adapt commonCreateBoardRelationship.
	return uc.commonCreateBoardRelationship(dto, "BLE")
}