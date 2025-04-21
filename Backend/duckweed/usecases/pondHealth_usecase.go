package usecases

import (
	"main/duckweed/entities"
	"main/duckweed/repositories"
)

// func (uc *PondHealthUseCase) CreatePondHealth(pond entities.PondHealth) (*entities.PondHealth, error) {
// 	// Additional logic for creating pond health records
// 	err := uc.repo.Create(pond)
// 	return &pond, err
// }

type PondHealthUseCase interface {
	GetPondHealthByID(id uint) (*entities.PondHealth, error)
	GetAllPondHealth() ([]entities.PondHealth, error)
	GetPondHealthByUserID(id uint) ([]entities.PondHealth, error)
	// CreateUser(dto *entities.InsertUserDto) (*entities.User, error)
}



type pondHealthUseCase struct {
	repo repositories.PondHealthRepository
}

func NewpondHealthUseCase(repo repositories.PondHealthRepository) PondHealthUseCase {
	return &pondHealthUseCase{repo: repo}
}

func (u *pondHealthUseCase) GetPondHealthByID(id uint) (*entities.PondHealth, error) {
	return u.repo.FindByID(id)
}

func (u *pondHealthUseCase) GetAllPondHealth() ([]entities.PondHealth, error) {
	return u.repo.FindAll()
}

func (u *pondHealthUseCase) GetPondHealthByUserID(userId uint) ([]entities.PondHealth, error) {
	return u.repo.FindByUserID(userId)
}