package usecases

import (
	"main/duckweed/entities"
	"main/duckweed/repositories"
	"main/ports"
)

type BoardUseCaseInterface interface {
	CreateBoard(dto entities.InsertBoardDto) (*entities.Board, error)
	GetAllBoards() ([]entities.Board, error)
	GetBoardByID(id uint) (*entities.Board, error)
	GetBoardByBoardID(boardID string) (*entities.Board, error)
	UpdateSensorFrequency(boardID string, dto entities.UpdateSensorFrequencyDto) error
}

type BoardUseCase struct {
	repo repositories.BoardRepositoryInterface
	publisher ports.MQTTPublisher
}

func NewBoardUseCase(repo repositories.BoardRepositoryInterface, publisher ports.MQTTPublisher) BoardUseCaseInterface { 
	return &BoardUseCase{repo: repo, publisher: publisher} 
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

func (uc *BoardUseCase) UpdateSensorFrequency(boardID string, dto entities.UpdateSensorFrequencyDto) error {
	err := uc.repo.UpdateSensorFrequency(boardID, *dto.SensorFrequency)
	if err != nil {
		return err
	}
	uc.publisher.PublishSensorFrequency(boardID, *dto.SensorFrequency) 
	return nil
}