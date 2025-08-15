package models

type AddboardData struct {
	SensorID        uint    `json:"sensor_id"`
	BoardName       string  `json:"board_name"`
	BoardStatus     string  `json:"board_status"`
	LastSeen string `json:"last_seen"`
	RunTime string `json:"runtime"`
	BoardRegisterDate string `json:"board_register_date"`
}