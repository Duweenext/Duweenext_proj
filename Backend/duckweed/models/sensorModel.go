package models

type AddSensorData struct {
	SensorName    string  `json:"sensorname"`
	SensorType    string  `json:"sensortype"`
	SensorStatus  string  `json:"sensorstatus"`
	SensorThreshold float64 `json:"sensorthreshold"`
	SensorFrequency int64   `json:"sensorfrequency"`
}