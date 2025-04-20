package repositories

import (
	"gorm.io/gorm"
	"main/duckweed/entities"
)

type BoardRepository struct {
	db *gorm.DB
}

func NewBoardRepository(db *gorm.DB) *BoardRepository {
	return &BoardRepository{db}
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