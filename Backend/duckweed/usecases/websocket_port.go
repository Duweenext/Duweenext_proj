package usecases

import "main/duckweed/entities"

type WebSocketOutputPort interface {
	BroadcastSensorData(data *entities.SensorData)
	BroadcastStatus(status *entities.BoardStatus)
	// Potentially other operations like:
	// SendMessageToClient(clientID string, message string)
	// RegisterClient(clientID string, connection interface{}) // Connection might be an interface
	// UnregisterClient(clientID string)
}