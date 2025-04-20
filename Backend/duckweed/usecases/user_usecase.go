package usecases

import (
	"main/duckweed/entities"
	"main/duckweed/repositories"

)


type UserUseCase interface {
	GetUserByID(id uint) (*entities.User, error)
	GetAllUsers() ([]entities.User, error)
	// CreateUser(dto *entities.InsertUserDto) (*entities.User, error)
}



type userUseCase struct {
	repo repositories.UserRepository
}

func NewUserUseCase(repo repositories.UserRepository) UserUseCase {
	return &userUseCase{repo: repo}
}

func (u *userUseCase) GetUserByID(id uint) (*entities.User, error) {
	return u.repo.FindByID(id)
}

func (u *userUseCase) GetAllUsers() ([]entities.User, error) {
	return u.repo.FindAll()
}

// func (u *userUseCase) CreateUser(dto *entities.InsertUserDto) (*entities.User, error) {
// 	return u.repo.CreateUser(dto)
// }
