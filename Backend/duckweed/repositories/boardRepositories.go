package repositories

import (
	"gorm.io/gorm"
	"main/duckweed/entities"
	"time"
)

type BoardRepositoryInterface interface {
	FindAll() ([]entities.Board, error)
	FindByID(id uint) (*entities.Board, error)
	FindByBoardID(boardID string) (*entities.Board, error)
	Create(board *entities.Board) (*entities.Board, error)
}

type BoardRepository struct {
	db *gorm.DB
}

func NewBoardRepository(db *gorm.DB) BoardRepositoryInterface {
	return &BoardRepository{db}
}

func (r *BoardRepository) FindByBoardID(boardID string) (*entities.Board, error) {
	var board entities.Board
	err := r.db.Where("board_id = ?", boardID).First(&board).Error
	if err != nil {
		if err == gorm.ErrRecordNotFound {
			return nil, nil 
		}
		return nil, err
	}
	return &board, nil
}

func (r *BoardRepository) Create(board *entities.Board) (*entities.Board, error) {
	now := time.Now()
	activeStatus := entities.BoardStatusActive
	board.BoardRegisterDate = &now
	board.BoardStatus = &activeStatus
	board.LastSeen = &now

	if err := r.db.Create(board).Error; err != nil {
		return nil, err
	}
	return board, nil
}

func (r *BoardRepository) FindAll() ([]entities.Board, error) {
	var boards []entities.Board
	err := r.db.Preload("Sensors").Find(&boards).Error
	return boards, err
}

func (r *BoardRepository) FindByID(id uint) (*entities.Board, error) {
	var board entities.Board
	err := r.db.Preload("Sensors").First(&board, id).Error
	return &board, err
}
