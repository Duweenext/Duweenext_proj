package mqtt

import (
	"encoding/json"
	"fmt"
	"log"
	"strings"
	"time"

	"main/config"
	"main/duckweed/entities"
	"main/server"

	mqtt "github.com/eclipse/paho.mqtt.golang"
	"gorm.io/gorm"
)

var db *gorm.DB
var serverInstance server.Server
var mqttConfig *config.Config

func Initialize(database *gorm.DB, conf *config.Config, s server.Server) mqtt.Client {
	db = database
	serverInstance = s
	mqttConfig = conf
	opts := mqtt.NewClientOptions().
		AddBroker(conf.MQTT.BrokerURL).
		SetClientID(conf.MQTT.ClientID)

	opts.SetDefaultPublishHandler(func(client mqtt.Client, msg mqtt.Message) {
		fmt.Printf("Received unexpected message on topic: %s\n", msg.Topic())
		fmt.Printf("Message: %s\n", msg.Payload())
	})

	opts.OnConnect = func(c mqtt.Client) {
		log.Println("Connected to MQTT broker")
		subscribe(c, conf.MQTT.TopicTelemetry, handleTelemetryMessage)
		subscribe(c, conf.MQTT.TopicStatus, handleStatusMessage)
	}

	opts.SetConnectionLostHandler(func(c mqtt.Client, err error) {
		log.Printf("Connection to MQTT broker lost: %v", err)
	})

	client := mqtt.NewClient(opts)
	if token := client.Connect(); token.Wait() && token.Error() != nil {
		log.Fatalf("Failed to connect to MQTT broker: %v", token.Error())
		return nil
	}

	return client
}

func subscribe(client mqtt.Client, topic string, handler mqtt.MessageHandler) {
	token := client.Subscribe(topic, 1, handler)
	token.Wait()
	if token.Error() != nil {
		log.Fatalf("Failed to subscribe to topic '%s': %v", topic, token.Error())
	}
	log.Printf("Subscribed to topic: %s\n", topic)
}

func handleTelemetryMessage(client mqtt.Client, msg mqtt.Message) {
	log.Printf("Received telemetry message on topic: %s", msg.Topic())

	parts := strings.Split(msg.Topic(), "/")
	if len(parts) != 3 || parts[0] != "iot" || parts[2] != "telemetry" {
		log.Printf("Could not extract Board ID from telemetry topic: %s", msg.Topic())
		return
	}
	boardIdStr := parts[1]

	var dto entities.InsertSensorLogDto
	if err := json.Unmarshal(msg.Payload(), &dto); err != nil {
		log.Printf("Error unmarshaling telemetry payload: %v", err)
		return
	}

	var board entities.Board
	if err := db.Where("board_id = ?", boardIdStr).First(&board).Error; err != nil {
		log.Printf("Board with BoardID %s not found in database", boardIdStr)
		return
	}

	var relationshipCount int64
	if err := db.Model(&entities.BoardRelationship{}).Where("board_id = ?", board.BoardID).Count(&relationshipCount).Error; err != nil {
		log.Printf("Error checking board relationships for board %d: %v", board.ID, err)
		return
	}

	if relationshipCount == 0 {
		log.Printf("No user relationship found for board %d (%s). Discarding telemetry.", board.ID, boardIdStr)
		return
	}

	sensorLog := &entities.SensorLog{
		BoardID:     &board.BoardID,
		Temperature: &dto.Temperature,
		Ec:          &dto.Ec,
		Ph:          &dto.Ph,
	}

	if err := db.Create(&sensorLog).Error; err != nil {
		log.Printf("Failed to save sensor log: %v", err)
		return
	}
	log.Printf("Successfully saved sensor log for BoardID: %s", *sensorLog.BoardID)

	if serverInstance != nil {
		serverInstance.BroadcastTelemetryData(board.BoardID, sensorLog)
	} else {
		log.Println("serverInstance is nil, cannot broadcast WebSocket message")
	}

	updateBoardLastSeen(board.ID)
}

func handleStatusMessage(client mqtt.Client, msg mqtt.Message) {
	log.Printf("Received status message on topic: %s", msg.Topic())

	parts := strings.Split(msg.Topic(), "/")
	if len(parts) != 3 || parts[0] != "iot" || parts[2] != "status" {
		log.Printf("Could not extract Board ID from status topic: %s", msg.Topic())
		return
	}
	boardIdStr := parts[1]

	statusText := string(msg.Payload())
	statusEnum := entities.BoardStatusEnum(statusText)

	switch statusEnum {
	case entities.BoardStatusActive, entities.BoardStatusInactive, entities.BoardStatusDisabled:
	default:
		log.Printf("Invalid status received for board %s: %s", boardIdStr, statusText)
		return
	}

	var board entities.Board
	if err := db.Where("board_id = ?", boardIdStr).First(&board).Error; err != nil {
		log.Printf("Board with BoardID %s not found: %v", boardIdStr, err)
		return
	}

	now := time.Now()
	board.BoardStatus = &statusEnum
	board.LastSeen = &now

	if err := db.Save(&board).Error; err != nil {
		log.Printf("Failed to update board status for BoardID %s: %v", boardIdStr, err)
		return
	}

	log.Printf("Updated status for board %s to %s", boardIdStr, statusText)

	if serverInstance != nil {
		serverInstance.BroadcastStatus(&board)
	}
}

func updateBoardLastSeen(boardID uint) {
	now := time.Now()
	result := db.Model(&entities.Board{}).Where("id = ?", boardID).Update("last_seen", &now)
	if result.Error != nil {
		log.Printf("Failed to update LastSeen for board %d: %v", boardID, result.Error)
	} else if result.RowsAffected > 0 {
		log.Printf("Updated LastSeen for board %d", boardID)
	}
}
