package repositories

import (
	"log"
	"main/duckweed/entities"

	"gorm.io/gorm"
)

type BoardRelationshipRepositoryInterface interface {
	Create(relationship *entities.BoardRelationship) (*entities.BoardRelationship, error)
	FindByBoardIDAndUserID(boardID string, userID uint) (*entities.BoardRelationship, error)
	FindByUserID(userID uint) ([]entities.BoardRelationship, error)
	FindByID(id uint) (*entities.BoardRelationship, error)
	Update(relationship *entities.BoardRelationship) (*entities.BoardRelationship, error)
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

func (r *BoardRelationshipRepository) FindByUserID(userID uint) ([]entities.BoardRelationship, error) {
	var relationships []entities.BoardRelationship
	log.Printf("[DEBUG-REPO] Querying for all relationships with UserID: %d\n", userID)
	err := r.db.Where("user_id = ?", userID).Find(&relationships).Error
	if err != nil {
		log.Printf("[ERROR-REPO] GORM Find failed for UserID %d: %v\n", userID, err)
		return nil, err
	}
	log.Printf("[DEBUG-REPO] Found %d relationships in DB for UserID: %d\n", len(relationships), userID)
	return relationships, nil
}

func (r *BoardRelationshipRepository) FindByID(id uint) (*entities.BoardRelationship, error) {
	var relationship entities.BoardRelationship
	err := r.db.First(&relationship, id).Error
	if err != nil {
		if err == gorm.ErrRecordNotFound {
			return nil, nil
		}
		return nil, err
	}
	return &relationship, nil
}

func (r *BoardRelationshipRepository) Update(relationship *entities.BoardRelationship) (*entities.BoardRelationship, error) {
	if err := r.db.Save(relationship).Error; err != nil {
		log.Printf("[ERROR-REPO] GORM Update failed: %v. Input data was: %+v", err, relationship)
		return nil, err
	}
	return relationship, nil
}