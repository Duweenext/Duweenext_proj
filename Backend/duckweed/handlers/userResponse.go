package handlers

import (
	"fmt"
	"main/duckweed/entities"
	"main/duckweed/usecases"
	"main/duckweed/utils"
	"strconv"

	"github.com/gofiber/fiber/v2"
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

func (h *UserHandler) Login(c *fiber.Ctx) error {
	var req entities.AuthenticateUserDto
	if err := c.BodyParser(&req); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "Invalid request body"})
	}

	fmt.Println(req.Email + req.Password + req.UserName)

	user, err := h.UseCase.Login(req.Email, req.Password)
	fmt.Println("Hello")
	if err != nil {
		fmt.Println("Error")
		return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{"error": "Invalid Credential"})
	}

	token, err := utils.GenerateJWT(*user.UserID)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "Token generation failed"})
	}

	return c.JSON(fiber.Map{
		"token": token,
		"user": fiber.Map{
			"id":       user.UserID,
			"email":    user.Email,
			"username": user.UserName,
		},
	})
}

func (h *UserHandler) Register(c *fiber.Ctx) error {
	var req entities.InsertUserDto
	if err := c.BodyParser(&req); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "Invalid request body"})
	}

	user, err := h.UseCase.Register(req.UserName, req.Email, req.Password)
	fmt.Println("Hello")
	if err != nil {
		return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{"error": "Invalid Credential"})
	}

	token, err := utils.GenerateJWT(*user.UserID)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "Token generation failed"})
	}

	return c.JSON(fiber.Map{
		"token": token,
		"user": fiber.Map{
			"id":       user.UserID,
			"email":    user.Email,
			"username": user.UserName,
		},
	})
}
