package usecases

import (
	"errors"
	"fmt"
	"main/duckweed/entities"
	"main/duckweed/repositories"

	"golang.org/x/crypto/bcrypt"
)

type UserUseCase interface {
	GetUserByID(id uint) (*entities.User, error)
	GetAllUsers() ([]entities.User, error)
	Login(email, password string) (*entities.User, error)
	Register(username, email, password string) (*entities.User, error)
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

func (u *userUseCase) Login(email, password string) (*entities.User, error) {
	fmt.Print(email)
	user, err := u.repo.FindByEmail(email)
	if err != nil {
		return nil, err
	}

	if err := bcrypt.CompareHashAndPassword([]byte(*user.Password), []byte(password)); err != nil {
		return nil, errors.New("invalid credentials")
	}

	fmt.Print(user)

	return user, nil
}

func (u *userUseCase) Register(username, email, password string) (*entities.User, error) {
	// isEmailAvailable, err := u.repo.EmailNotRegistered(email)
	// if err != nil {
	// 	return nil, err
	// }
	// if isEmailAvailable {
	// 	return nil, errors.New("email already in use")
	// }

	// isUsernameAvailable, err := u.repo.UsernameNotRegistered(username)
	// if err != nil {
	// 	return nil, err
	// }
	// if isUsernameAvailable {
	// 	return nil, errors.New("username already in use")
	// }

	hashed, err := bcrypt.GenerateFromPassword([]byte(password), bcrypt.DefaultCost)
	if err != nil {
		return nil, err
	}
	return u.repo.CreateUser(username, email, string(hashed))
}

// usecases/user_usecase.go

// func (u *userUseCase) CreateUser(dto *entities.InsertUserDto) (*entities.User, error) {
// 	return u.repo.CreateUser(dto)
// }
