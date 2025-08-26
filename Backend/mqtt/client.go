package mqtt

import (
	"encoding/json"
	"fmt"
	"log"
	"math/rand"
	"strconv"
	"strings"
	"time"

	"main/config"
	"main/duckweed/entities"
	"main/ports"

	mqtt "github.com/eclipse/paho.mqtt.golang"
	"gorm.io/gorm"
)

var db *gorm.DB
var broadcaster ports.Broadcaster 
var mqttConfig *config.Config
var mqttClient mqtt.Client

func Initialize(database *gorm.DB, conf *config.Config, b ports.Broadcaster) mqtt.Client {
	db = database
	broadcaster = b
	mqttConfig = conf

	// --- FIX 1: Ensure ClientID is always unique ---
	// Appending a random number to the client ID prevents conflicts on reconnect.
	uniqueClientID := conf.MQTT.ClientID + "-" + strconv.Itoa(rand.Intn(1000))
	log.Printf("Connecting to MQTT with ClientID: %s", uniqueClientID)

	opts := mqtt.NewClientOptions().
		AddBroker(conf.MQTT.BrokerURL).
		SetClientID(uniqueClientID) // Use the unique ID

	// Add robust reconnect logic
	opts.SetAutoReconnect(true)
	opts.SetMaxReconnectInterval(10 * time.Second)

	opts.OnConnect = func(c mqtt.Client) {
		log.Println("Successfully connected to MQTT broker")
		subscribe(c, conf.MQTT.TopicTelemetry, handleTelemetryMessage)
		subscribe(c, conf.MQTT.TopicStatus, handleStatusMessage)
	}
	opts.SetConnectionLostHandler(func(c mqtt.Client, err error) {
		log.Printf("Connection to MQTT broker lost: %v. Retrying...", err)
	})
	opts.OnReconnecting = func(c mqtt.Client, opts *mqtt.ClientOptions) {
		log.Println("Attempting to reconnect to MQTT broker...")
	}

	client := mqtt.NewClient(opts)
	if token := client.Connect(); token.Wait() && token.Error() != nil {
		log.Fatalf("Failed to connect to MQTT broker: %v", token.Error())
		return nil
	}
	mqttClient = client
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
		Temperature: dto.Temperature,
		Ec:          dto.Ec,
		Ph:          dto.Ph,
	}

	if err := db.Create(&sensorLog).Error; err != nil {
		log.Printf("Failed to save sensor log: %v", err)
		return
	}
	log.Printf("Successfully saved sensor log for BoardID: %s", *sensorLog.BoardID)

	// After saving, check thresholds and broadcast telemetry
	checkThresholdsAndNotify(&board, &dto)

	if broadcaster != nil { 
		broadcaster.BroadcastTelemetryData(board.BoardID, sensorLog) 
	} else {
		log.Println("broadcaster is nil, cannot broadcast WebSocket message")
	}

	updateBoardLastSeen(board.ID)
}

// checkThresholdsAndNotify checks telemetry data against predefined sensor thresholds.
func checkThresholdsAndNotify(board *entities.Board, telemetry *entities.InsertSensorLogDto) {
	var sensors []entities.Sensor
	if err := db.Where("board_id = ?", board.ID).Find(&sensors).Error; err != nil {
		log.Printf("Could not retrieve sensors for board ID %d to check thresholds: %v", board.ID, err)
		return
	}

	for _, sensor := range sensors {
		var alertMessage string
		switch sensor.SensorType {
		case entities.SensorTypeTemperature:
			if sensor.SensorThresholdMax != nil && telemetry.Temperature > *sensor.SensorThresholdMax {
				alertMessage = fmt.Sprintf("Temperature (%.2f) exceeded maximum threshold (%.2f)", telemetry.Temperature, *sensor.SensorThresholdMax)
			}
			if sensor.SensorThresholdMin != nil && telemetry.Temperature < *sensor.SensorThresholdMin {
				alertMessage = fmt.Sprintf("Temperature (%.2f) is below minimum threshold (%.2f)", telemetry.Temperature, *sensor.SensorThresholdMin)
			}
		case entities.SensorTypeEC:
			if sensor.SensorThresholdMax != nil && telemetry.Ec > *sensor.SensorThresholdMax {
				alertMessage = fmt.Sprintf("EC (%.2f) exceeded maximum threshold (%.2f)", telemetry.Ec, *sensor.SensorThresholdMax)
			}
			if sensor.SensorThresholdMin != nil && telemetry.Ec < *sensor.SensorThresholdMin {
				alertMessage = fmt.Sprintf("EC (%.2f) is below minimum threshold (%.2f)", telemetry.Ec, *sensor.SensorThresholdMin)
			}
		case entities.SensorTypePH:
			if sensor.SensorThresholdMax != nil && telemetry.Ph > *sensor.SensorThresholdMax {
				alertMessage = fmt.Sprintf("pH (%.2f) exceeded maximum threshold (%.2f)", telemetry.Ph, *sensor.SensorThresholdMax)
			}
			if sensor.SensorThresholdMin != nil && telemetry.Ph < *sensor.SensorThresholdMin {
				alertMessage = fmt.Sprintf("pH (%.2f) is below minimum threshold (%.2f)", telemetry.Ph, *sensor.SensorThresholdMin)
			}
		}

		if alertMessage != "" {
			// Print the alert to the console
			log.Printf("[ALERT] Board %s: %s", board.BoardID, alertMessage)
		}
	}
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

	if broadcaster != nil { 
		broadcaster.BroadcastStatus(&board) 
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

func (p *Publisher) PublishSensorFrequency(boardID string, frequency float64) {
	topic := fmt.Sprintf("iot/%s/frequency", boardID)
	payload, err := json.Marshal(map[string]float64{"frequency": frequency})
	if err != nil {
		log.Printf("Error marshaling frequency payload: %v", err)
		return
	}
	token := mqttClient.Publish(topic, 1, false, payload)
	token.Wait()
	if token.Error() != nil {
		log.Printf("Failed to publish frequency to topic '%s': %v", topic, token.Error())
	} else {
		log.Printf("Published frequency to topic: %s", topic)
	}
}

type Publisher struct{}