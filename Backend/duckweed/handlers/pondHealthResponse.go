package handlers

import (
	"main/duckweed/entities"
	"main/duckweed/usecases"
	"strconv"

	"github.com/gofiber/fiber/v2"
)

type PondHealthHandler struct {
	UseCase usecases.PondHealthUseCase
}

func NewPondHealthHandler(useCase usecases.PondHealthUseCase) *PondHealthHandler {
	return &PondHealthHandler{UseCase: useCase}
}

func (h *PondHealthHandler) GetAllPondHealth(c *fiber.Ctx) error {
	ponds, err := h.UseCase.GetAllPondHealth()
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": err.Error()})
	}
	return c.JSON(ponds)
}

func (h *PondHealthHandler) GetPondHealthByID(c *fiber.Ctx) error {
	idParam := c.Params("id")
	id, err := strconv.Atoi(idParam)
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "invalid ID"})
	}
	pond, err := h.UseCase.GetPondHealthByID(uint(id))
	if err != nil {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{"error": err.Error()})
	}
	return c.JSON(pond)
}

func (h *PondHealthHandler) GetPondHealthByUserID(c *fiber.Ctx) error {
	idParam := c.Params("userid")
	id, err := strconv.Atoi(idParam)
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "invalid ID"})
	}
	ponds, err := h.UseCase.GetPondHealthByUserID(uint(id))
	if err != nil {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{"error": err.Error()})
	}
	return c.JSON(ponds)
}

func (h *PondHealthHandler) PostPondHealth(c *fiber.Ctx) error {
	dto := new(entities.InsertPondHealthDto)
	if err := c.BodyParser(dto); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": err.Error()})
	}

	pond, err := h.UseCase.PostPondHealth(dto)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": err.Error()})
	}

	return c.Status(fiber.StatusCreated).JSON(pond)
}
