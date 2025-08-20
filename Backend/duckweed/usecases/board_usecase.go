package usecases

import (
	"main/duckweed/entities"
	"main/duckweed/repositories"
)

type BoardUseCaseInterface interface {
	CreateBoard(dto entities.InsertBoardDto) (*entities.Board, error)
	GetAllBoards() ([]entities.Board, error)
	GetBoardByID(id uint) (*entities.Board, error)
	GetBoardByBoardID(boardID string) (*entities.Board, error) 
}

type BoardUseCase struct {
	repo repositories.BoardRepositoryInterface
}

func NewBoardUseCase(repo repositories.BoardRepositoryInterface) BoardUseCaseInterface {
	return &BoardUseCase{repo}
}

func (uc *BoardUseCase) CreateBoard(dto entities.InsertBoardDto) (*entities.Board, error) {
	board := &entities.Board{
		BoardID:   dto.BoardID,
		BoardName: dto.BoardName,
	}
	return uc.repo.Create(board)
}

func (uc *BoardUseCase) GetAllBoards() ([]entities.Board, error) {
	return uc.repo.FindAll()
}

func (uc *BoardUseCase) GetBoardByID(id uint) (*entities.Board, error) {
	return uc.repo.FindByID(id)
}

func (uc *BoardUseCase) GetBoardByBoardID(boardID string) (*entities.Board, error) {
	return uc.repo.FindByBoardID(boardID)
}
