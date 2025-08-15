package usecases

import "main/duckweed/entities"

type WebSocketOutputPort interface {
	BroadcastSensorData(data *entities.SensorLog)
	BroadcastStatus(status *entities.Board)
	// Potentially other operations like:
	// SendMessageToClient(clientID string, message string)
	// RegisterClient(clientID string, connection interface{}) // Connection might be an interface
	// UnregisterClient(clientID string)
}