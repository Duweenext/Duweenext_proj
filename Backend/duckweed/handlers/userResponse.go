package handlers

import (
	"github.com/gofiber/fiber/v2"
	"main/duckweed/usecases"
	"strconv"
)

type UserHandler struct {
	UseCase usecases.UserUseCase
}

func NewUserHandler(useCase usecases.UserUseCase) *UserHandler {
	return &UserHandler{UseCase: useCase}
}

// func (h *UserHandler) CreateUser(c *fiber.Ctx) error {
// 	dto := new(entities.InsertUserDto)
// 	if err := c.BodyParser(dto); err != nil {
// 		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": err.Error()})
// 	}

// 	user, err := h.UseCase.CreateUser(dto)
// 	if err != nil {
// 		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": err.Error()})
// 	}

// 	return c.Status(fiber.StatusCreated).JSON(user)
// }

func (h *UserHandler) GetAllUsers(c *fiber.Ctx) error {
	users, err := h.UseCase.GetAllUsers()
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": err.Error()})
	}
	return c.JSON(users)
}

func (h *UserHandler) GetUserByID(c *fiber.Ctx) error {
	idParam := c.Params("id")
	idUint, err := strconv.ParseUint(idParam, 10, 64)
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "Invalid ID"})
	}

	user, err := h.UseCase.GetUserByID(uint(idUint))
	if err != nil {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{"error": err.Error()})
	}

	return c.JSON(user)
}
