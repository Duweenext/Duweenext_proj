package mqtt

import (
	"encoding/json"
	"fmt"
	"log"
	"strings"
	"time"

	"main/config"            // Adjust the import path if needed
	"main/duckweed/entities" // Adjust the import path if needed
	"main/server"            // Adjust the import path if needed

	mqtt "github.com/eclipse/paho.mqtt.golang"
	"gorm.io/gorm"
)

var db *gorm.DB
var serverInstance server.Server // Changed to concrete type, not pointer to interface
var mqttConfig *config.Config    // Store MQTT config

// Initialize connects to the MQTT broker and subscribes to topics.
func Initialize(database *gorm.DB, conf *config.Config, s server.Server) mqtt.Client { // Changed s type
	db = database
	serverInstance = s
	mqttConfig = conf // Store
	opts := mqtt.NewClientOptions().
		AddBroker(conf.MQTT.BrokerURL).
		SetClientID(conf.MQTT.ClientID)

	opts.SetDefaultPublishHandler(func(client mqtt.Client, msg mqtt.Message) {
		fmt.Printf("Received unexpected message on topic: %s\n", msg.Topic())
		fmt.Printf("Message: %s\n", msg.Payload())
	})

	opts.OnConnect = func(c mqtt.Client) {
		log.Println("Connected to MQTT broker")
		subscribe(c, conf.MQTT.TopicTelemetry, handleTelemetryMessage) // Subscribe to telemetry
		subscribe(c, conf.MQTT.TopicStatus, handleStatusMessage)   // Subscribe to status
	}

	opts.SetConnectionLostHandler(func(c mqtt.Client, err error) {
		log.Printf("Connection to MQTT broker lost: %v", err)
		// Implement reconnection logic here if needed
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

// handleTelemetryMessage handles messages received on the telemetry topic.
func handleTelemetryMessage(client mqtt.Client, msg mqtt.Message) {
	log.Printf("Received telemetry message on topic: %s\n", msg.Topic())
	log.Printf("Telemetry Message: %s\n", msg.Payload())

	// Extract the device ID from the topic
	parts := strings.Split(msg.Topic(), "/")
	var boardId string // Changed from deviceId to boardId to match your database
	if len(parts) == 3 && parts[0] == "iot" && parts[2] == "telemetry" {
		boardId = parts[1] // Now boardId
		log.Printf("Telemetry Device ID: %s\n", boardId)
	} else {
		log.Printf("Could not extract Board ID from telemetry topic: %s\n", msg.Topic())
		return
	}

	var sensorData entities.SensorData
	err := json.Unmarshal(msg.Payload(), &sensorData) // Assuming JSON payload
	if err != nil {
		log.Printf("Error unmarshaling telemetry payload: %v", err)
		return
	}

	// Fetch the user ID from the database based on the board ID.
	userID, err := getUserIdFromBoardId(boardId) // Now using boardId
	if err != nil {
		log.Printf("Error fetching User ID from database: %v", err)
		return // Important:  Return here to prevent processing with invalid User ID.
	}
	if userID == 0 {
		log.Printf("User ID not found for Board ID: %s\n", boardId)
		return // IMPORTANT: return, do not process further
	}

	sensorData.UserID = userID // Set the UserID, converting int to uint

	// Broadcast the received sensor data via WebSocket
	if serverInstance != nil {
		serverInstance.BroadcastSensorData(&sensorData)
	} else {
		log.Println("serverInstance is nil, cannot broadcast WebSocket message")
	}
	updateLastSeen(boardId)
}

// handleStatusMessage handles messages received on the status topic.
func handleStatusMessage(client mqtt.Client, msg mqtt.Message) {
	log.Printf("Received status message on topic: %s\n", msg.Topic())
	log.Printf("Status Message Payload: %s\n", msg.Payload())

	// Extract Board ID
	parts := strings.Split(msg.Topic(), "/")
	var boardId string
	if len(parts) == 3 && parts[0] == "iot" && parts[2] == "status" {
		boardId = parts[1]
		log.Printf("Status Device ID: %s\n", boardId)
	} else {
		log.Printf("Could not extract Board ID from status topic: %s\n", msg.Topic())
		return
	}

	statusText := string(msg.Payload())

	// Get the user ID from board_id
	userID, err := getUserIdFromBoardId(boardId)
	if err != nil {
		log.Printf("Error getting User ID for Board ID %s: %v", boardId, err)
		return
	}
	if userID == 0 {
		log.Printf("User ID is 0 for board: %s. Skipping update.", boardId)
		return
	}

	// Upsert board status
	var boardStatus entities.BoardStatus
	result := db.
		Where("board_id = ?", boardId).
		First(&boardStatus)

	now := time.Now()

	if result.Error != nil {
		if result.Error == gorm.ErrRecordNotFound {
			// Create new
			boardStatus = entities.BoardStatus{
				BoardID:  boardId,
				UserID:   userID,
				Status:   statusText,
				LastSeen: now,
			}
			if err := db.Create(&boardStatus).Error; err != nil {
				log.Printf("Failed to insert board status: %v", err)
				return
			}
			log.Printf("Created new board status for %s", boardId)
		} else {
			log.Printf("Database error: %v", result.Error)
			return
		}
	} else {
		// Update existing
		boardStatus.Status = statusText
		boardStatus.UserID = userID
		boardStatus.LastSeen = now
		boardStatus.UpdatedAt = now
		if err := db.Save(&boardStatus).Error; err != nil {
			log.Printf("Failed to update board status: %v", err)
			return
		}
		log.Printf("Updated board status for %s", boardId)
	}

	// Broadcast
	if serverInstance != nil {
		serverInstance.BroadcastStatus(&boardStatus)
	}
}



// getUserIdFromBoardId retrieves the UserID from the database based on the BoardID.
func getUserIdFromBoardId(boardId string) (int, error) { // Changed return type to int
	var boardRelationship entities.BoardRelationship
	// Use First to get only one record.  If you expect multiple, you will need to change this.
	result := db.
		Where("board_id = ?", boardId).
		First(&boardRelationship) // Changed to board_id

	if result.Error != nil {
		if result.Error == gorm.ErrRecordNotFound {
			return 0, nil // Return 0, nil for not found (handle in caller)
		}
		return 0, fmt.Errorf("error querying board_relationships: %w", result.Error)
	}
	if boardRelationship.UserID == nil {
		return 0, fmt.Errorf("user ID is nil for Board ID: %s", boardId)
	}
	return int(*boardRelationship.UserID), nil //convert to int
}

func updateLastSeen(boardId string) {
	now := time.Now()
	var boardStatus entities.BoardStatus

	// Try to find the existing board status
	result := db.Where("board_id = ?", boardId).First(&boardStatus)
	if result.Error != nil {
		if result.Error == gorm.ErrRecordNotFound {
			// Create new if not found
			boardStatus = entities.BoardStatus{
				BoardID:  boardId,
				LastSeen: now,
			}
			db.Create(&boardStatus)
			log.Printf("Created new BoardStatus with LastSeen for board: %s", boardId)
			return
		}
		log.Printf("Error querying BoardStatus: %v", result.Error)
		return
	}

	// Update existing record
	boardStatus.LastSeen = now
	if err := db.Save(&boardStatus).Error; err != nil {
		log.Printf("Failed to update LastSeen for board %s: %v", boardId, err)
	} else {
		log.Printf("Updated LastSeen for board %s", boardId)
	}
}
