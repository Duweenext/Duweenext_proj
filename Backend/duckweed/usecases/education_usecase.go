package usecases

import (
	"main/duckweed/entities"
	"main/duckweed/repositories"
)

type EducationUseCase struct {
	repo repositories.EducationRepository
}

func NewEducationUseCase(repo repositories.EducationRepository) *EducationUseCase {
	return &EducationUseCase{repo}
}

func (uc *EducationUseCase) GetAllEducation() ([]entities.Education, error) {
	return uc.repo.FindAll()
}

func (uc *EducationUseCase) GetEducationByID(id uint) (*entities.Education, error) {
	return uc.repo.FindByID(id)
}

// func (uc *EducationUseCase) CreateEducation(edu entities.Education) (*entities.Education, error) {
// 	// Any validation or business logic for Education creation
// 	err := uc.repo.Create(edu)
// 	return &edu, err
// }
