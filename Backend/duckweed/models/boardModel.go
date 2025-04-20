package models

type AddboardData struct {
	SensorID        uint    `json:"sensor_id"`
	BoardName       string  `json:"board_name"`
	BoardStatus     string  `json:"board_status"`
}