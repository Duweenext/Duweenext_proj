package server

import (
	"main/duckweed/entities"
)

type Server interface {
  Start()
  BroadcastSensorData(data *entities.SensorData) 
  BroadcastStatus(status *entities.BoardStatus)
  // BroadcastSensorDataToClient(clientID string, data *entities.SensorData)
  // RegisterClient(clientID string, connection interface{})
}