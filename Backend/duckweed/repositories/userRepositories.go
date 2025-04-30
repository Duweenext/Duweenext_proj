package repositories

import (
	"errors"
	"main/duckweed/entities"

	"gorm.io/gorm"
)

// UserRepository

type UserRepository struct {
	db *gorm.DB
}

func NewUserRepository(db *gorm.DB) *UserRepository {
	return &UserRepository{db}
}

func (r *UserRepository) FindAll() ([]entities.User, error) {
	var users []entities.User
	err := r.db.Find(&users).Error
	return users, err
}

func (r *UserRepository) FindByID(id uint) (*entities.User, error) {
	var user entities.User
	err := r.db.First(&user, id).Error
	return &user, err
}

func (r *UserRepository) FindByEmail(email string) (*entities.User, error) {
	var user entities.User
	err := r.db.Where("email = ?", email).First(&user).Error

	return &user, err
}

func (r *UserRepository) EmailNotRegistered(email string) (bool, error) {
	var user entities.User
	err := r.db.Where("email = ?", email).First(&user).Error

	if errors.Is(err, gorm.ErrRecordNotFound) {
		return true, err
	}
	if err != nil {
		return false, err
	}
	return false, err
}

func (r *UserRepository) UsernameNotRegistered(username string) (bool, error) {
	var user entities.User
	err := r.db.Where("username = ?", username).First(&user).Error

	if errors.Is(err, gorm.ErrRecordNotFound) {
		return true, err
	}
	if err != nil {
		return false, err
	}
	return false, err
}

func (r *UserRepository) CreateUser(username, email, password string) (*entities.User, error) {
	user := entities.User{
		UserName: &username,
		Email:    &email,
		Password: &password,
	}
	err := r.db.Create(&user).Error

	return &user, err
}
