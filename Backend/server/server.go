package server

import (
	"main/ports"
)

type Server interface {
  Start()
  ports.Broadcaster
  // BroadcastSensorData(data *entities.SensorData)
  // BroadcastTelemetryData(boardId string,data *entities.SensorLog)
  // BroadcastStatus(status *entities.Board)
  // BroadcastSensorDataToClient(clientID string, data *entities.SensorData)
  // RegisterClient(clientID string, connection interface{})
}