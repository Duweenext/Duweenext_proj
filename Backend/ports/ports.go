package ports

type Broadcaster interface {
	BroadcastTelemetryData(boardID string, data interface{})
	BroadcastStatus(board interface{})
}

type MQTTPublisher interface {
	PublishSensorFrequency(boardID string, frequency float64)
}