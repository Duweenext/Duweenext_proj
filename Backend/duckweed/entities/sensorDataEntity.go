package entities

import "gorm.io/gorm"

type SensorData struct {
	gorm.Model
	UserID      int     `json:"userId"`
	Temperature float64 `json:"temperature"`
	PH          float64 `json:"ph"`
	TC          float64 `json:"tc"`
}