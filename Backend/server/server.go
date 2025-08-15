package server

import (
	"main/duckweed/entities"
)

type Server interface {
  Start()
  // BroadcastSensorData(data *entities.SensorData)
  BroadcastTelemetryData(boardId string,data *entities.SensorLog)
  BroadcastStatus(status *entities.Board)
  // BroadcastSensorDataToClient(clientID string, data *entities.SensorData)
  // RegisterClient(clientID string, connection interface{})
}