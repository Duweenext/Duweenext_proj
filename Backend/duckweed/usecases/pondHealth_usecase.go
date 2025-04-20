package usecases

import (
	"main/duckweed/entities"
	"main/duckweed/repositories"
)

type PondHealthUseCase struct {
	repo repositories.PondHealthRepository
}

func NewPondHealthUseCase(repo repositories.PondHealthRepository) *PondHealthUseCase {
	return &PondHealthUseCase{repo}
}

func (uc *PondHealthUseCase) GetAllPondHealth() ([]entities.PondHealth, error) {
	return uc.repo.FindAll()
}

func (uc *PondHealthUseCase) GetPondHealthByID(id uint) (*entities.PondHealth, error) {
	return uc.repo.FindByID(id)
}

// func (uc *PondHealthUseCase) CreatePondHealth(pond entities.PondHealth) (*entities.PondHealth, error) {
// 	// Additional logic for creating pond health records
// 	err := uc.repo.Create(pond)
// 	return &pond, err
// }
