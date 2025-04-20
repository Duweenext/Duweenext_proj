package usecases

import (
	"main/duckweed/entities"
	"main/duckweed/repositories"
)

type BoardUseCase struct {
	repo repositories.BoardRepository
}

func NewBoardUseCase(repo repositories.BoardRepository) *BoardUseCase {
	return &BoardUseCase{repo}
}

func (uc *BoardUseCase) GetAllBoards() ([]entities.Board, error) {
	return uc.repo.FindAll()
}

func (uc *BoardUseCase) GetBoardByID(id uint) (*entities.Board, error) {
	return uc.repo.FindByID(id)
}

// func (uc *BoardUseCase) CreateBoard(board entities.Board) (*entities.Board, error) {
// 	// Additional board creation logic can be added here
// 	err := uc.repo.Create(board)
// 	return &board, err
// }
