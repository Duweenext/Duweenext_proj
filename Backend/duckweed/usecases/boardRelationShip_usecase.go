package usecases

import (
	"errors"
	"fmt"
	"main/duckweed/entities"
	"main/duckweed/repositories"

	"golang.org/x/crypto/bcrypt"
)

type BoardRelationshipUseCaseInterface interface {
	CreateBoardRelationship(dto entities.InsertBoardRelationshipDto) (*entities.BoardRelationshipResponseDto, error)
}

type BoardRelationshipUseCase struct {
	boardRepo             repositories.BoardRepositoryInterface
	boardRelationshipRepo repositories.BoardRelationshipRepositoryInterface
}

func NewBoardRelationshipUseCase(
	boardRepo repositories.BoardRepositoryInterface,
	boardRelationshipRepo repositories.BoardRelationshipRepositoryInterface,
) BoardRelationshipUseCaseInterface {
	return &BoardRelationshipUseCase{
		boardRepo:             boardRepo,
		boardRelationshipRepo: boardRelationshipRepo,
	}
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
			BoardID:            dto.BoardID,
			BoardName:          dto.BoardName,
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
		ConStatus: createdRelationship.ConStatus,
		ConMethod: createdRelationship.ConMethod,
		CreatedAt: createdRelationship.CreatedAt,
		UpdatedAt: createdRelationship.UpdatedAt,
	}
	return responseDto, nil
}
