package usecases

import (
	"errors"
	"main/duckweed/entities"
	"main/duckweed/repositories"
)

type BoardRelationshipUseCaseInterface interface {
	CreateBoardRelationship(dto entities.InsertBoardRelationshipDto) (*entities.BoardRelationshipResponseDto, error)
}

type BoardRelationshipUseCase struct {
	repo repositories.BoardRelationshipRepositoryInterface
}

func NewBoardRelationshipUseCase(repo repositories.BoardRelationshipRepositoryInterface) BoardRelationshipUseCaseInterface {
	return &BoardRelationshipUseCase{
		repo: repo,
	}
}

func (uc *BoardRelationshipUseCase) CreateBoardRelationship(dto entities.InsertBoardRelationshipDto) (*entities.BoardRelationshipResponseDto, error) {
	switch dto.ConMethod {
	case entities.ConMethodManual:
	case entities.ConMethodBluetooth:
	default:
		return nil, errors.New("invalid connection method specified")
	}

	relationship := &entities.BoardRelationship{
		UserID:    dto.UserID,
		BoardID:   dto.BoardID,
		ConMethod: dto.ConMethod,
		ConStatus: entities.ConStatusActive,
	}

	createdRelationship, err := uc.repo.Create(relationship)
	if err != nil {
		return nil, err
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
