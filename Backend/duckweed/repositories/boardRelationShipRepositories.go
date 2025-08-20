package repositories

import (
	"log"
	"main/duckweed/entities"

	"gorm.io/gorm"
)

type BoardRelationshipRepositoryInterface interface {
	Create(relationship *entities.BoardRelationship) (*entities.BoardRelationship, error)
	FindByBoardIDAndUserID(boardID string, userID uint) (*entities.BoardRelationship, error)
}

type BoardRelationshipRepository struct {
	db *gorm.DB
}

func NewBoardRelationshipRepository(db *gorm.DB) BoardRelationshipRepositoryInterface {
	return &BoardRelationshipRepository{db: db}
}

func (r *BoardRelationshipRepository) Create(relationship *entities.BoardRelationship) (*entities.BoardRelationship, error) {
	log.Printf("[DEBUG-REPO] Attempting to create BoardRelationship in DB. Data before GORM Create: %+v\n", relationship)
	log.Printf("[DEBUG-REPO] Value of ConnectionID passed to GORM Create call: %d\n", relationship.ID)
	if err := r.db.Create(relationship).Error; err != nil {
		log.Printf("[ERROR-REPO] GORM Create failed: %v. Input data was: %+v", err, relationship) // Log GORM error
		return nil, err
	}

	log.Printf("[DEBUG-REPO] Successfully created BoardRelationship. DB assigned ConnectionID: %d\n", relationship.ID)
	return relationship, nil
}

func (r *BoardRelationshipRepository) FindByBoardIDAndUserID(boardID string, userID uint) (*entities.BoardRelationship, error) {
	var relationship entities.BoardRelationship
	err := r.db.Where("board_id = ? AND user_id = ?", boardID, userID).First(&relationship).Error
	if err != nil {
		if err == gorm.ErrRecordNotFound {
			return nil, nil
		}
		return nil, err
	}
	return &relationship, nil
}
