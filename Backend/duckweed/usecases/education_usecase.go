package usecases

import (
	"main/duckweed/entities"
	"main/duckweed/repositories"
)


type EducationUseCase interface {
	GetAllEducation() ([]entities.Education, error)
	GetEducationByID(id uint) (*entities.Education, error)
}



type educationUseCase struct {
	repo repositories.EducationRepository
}

func NewEducationUseCase(repo repositories.EducationRepository) EducationUseCase {
	return &educationUseCase{repo: repo}
}


func (uc *educationUseCase) GetAllEducation() ([]entities.Education, error) {
	return uc.repo.FindAll()
}

func (uc *educationUseCase) GetEducationByID(id uint) (*entities.Education, error) {
	return uc.repo.FindByID(id)
}

