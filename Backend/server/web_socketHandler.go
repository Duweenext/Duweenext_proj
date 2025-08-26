package server

import (
	"encoding/json"
	"log"
	"strconv"
	"time"

	"main/duckweed/entities"

	"github.com/gofiber/contrib/websocket"
	"github.com/gofiber/fiber/v2"
)

func (s *FiberServer) websocketHandler(c *fiber.Ctx) error {
	// 1) Extract userId and boardId from path params
	userIdStr := c.Params("userId")
	uid, err := strconv.ParseUint(userIdStr, 10, 32)
	if err != nil {
		log.Println("Invalid userId param:", userIdStr, err)
		return fiber.ErrBadRequest
	}
	userId := uint(uid)

	boardId := c.Params("boardId")
	if boardId == "" {
		log.Println("Missing boardId param")
		return fiber.ErrBadRequest
	}

	// 2) Upgrade to WebSocket, capturing userId and boardId
	if websocket.IsWebSocketUpgrade(c) {
		return websocket.New(func(conn *websocket.Conn) {
			log.Printf("Client Connected: user %d → board %s", userId, boardId)

			// 3) Check subscription
			if !s.isUserSubscribedToBoard(userId, boardId) {
				conn.WriteMessage(websocket.TextMessage,
					[]byte(`{"error":"not subscribed to board"}`))
				conn.Close()
				return
			}

			// 4) Register connection
			s.mutex.Lock()
			if s.clients[conn] == nil {
				s.clients[conn] = make(map[string]bool)
			}
			s.clients[conn][boardId] = true
			s.mutex.Unlock()

			defer func() {
				// Cleanup on disconnect
				s.mutex.Lock()
				delete(s.clients, conn)
				s.mutex.Unlock()
				conn.Close()
				log.Printf("Client Disconnected: user %d → board %s", userId, boardId)
			}()

			// 5) Acknowledge subscription
			conn.WriteMessage(websocket.TextMessage,
				[]byte(`{"type":"subscribed","boardId":"`+boardId+`"}`))

			// 6) Keep the connection alive
			for {
				if _, _, err := conn.ReadMessage(); err != nil {
					break
				}
			}
		})(c)
	}

	return fiber.ErrUpgradeRequired
}

func (s *FiberServer) isUserSubscribedToBoard(userID uint, boardID string) bool {
	var relationship entities.BoardRelationship
	result := s.db.GetDb().Where("user_id = ? AND board_id = ?", userID, boardID).First(&relationship)
	return result.Error == nil // Return true if relationship exists
}

func (s *FiberServer) BroadcastTelemetryData(boardID string, data interface{}) {
    s.mutex.Lock()
    defer s.mutex.Unlock()

    sensorLog, ok := data.(*entities.SensorLog)
    if !ok {
        log.Println("Error: could not assert telemetry data to *entities.SensorLog")
        return
    }

    envelope := struct {
        Type string              `json:"type"`
        Data *entities.SensorLog `json:"data"`
    }{
        Type: "telemetry",
        Data: sensorLog, 
    }
    
    payload, err := json.Marshal(envelope)
    if err != nil {
        log.Println("Error marshaling telemetry data:", err)
        return
    }

    for conn, boardMap := range s.clients {
        if _, ok := boardMap[boardID]; ok {
            if err := conn.WriteMessage(websocket.TextMessage, payload); err != nil {
                log.Println("Error sending telemetry to client:", err)
                conn.Close()
                delete(s.clients, conn)
            }
        }
    }
}

func (s *FiberServer) BroadcastStatus(boardData interface{}) {
	status, ok := boardData.(*entities.Board)
	if !ok {
		log.Println("Error: could not assert boardData to *entities.Board")
		return
	}

	envelope := struct {
		Type string           `json:"type"`
		Data *entities.Board `json:"data"`
	}{
		Type: "status",
		Data: status,
	}

	payload, err := json.Marshal(envelope)
	if err != nil {
		log.Println("Error marshaling board status:", err)
		return
	}

	s.mutex.Lock()
	defer s.mutex.Unlock()
	for client, subscriptions := range s.clients {
		if subscriptions[status.BoardID] { // Check if the client is subscribed to this board
			if err := client.WriteMessage(websocket.TextMessage, payload); err != nil {
				log.Println("Broadcast Status Error:", err)
				client.Close()
				delete(s.clients, client)
			}
		}
	}
}

// monitorBoardStatus periodically checks for inactive boards and updates their status.
func (s *FiberServer) monitorBoardStatus() {
	ticker := time.NewTicker(30 * time.Second)
	defer ticker.Stop()

	for {
		<-ticker.C
		var boards []entities.Board
		if err := s.db.GetDb().Find(&boards).Error; err != nil {
			log.Printf("Error checking board statuses: %v", err)
			continue
		}

		now := time.Now()
		for i := range boards {
			board := &boards[i]
			if board.LastSeen != nil && now.Sub(*board.LastSeen) > time.Minute {
				if board.BoardStatus == nil || *board.BoardStatus != entities.BoardStatusInactive {
					inactiveStatus := entities.BoardStatusInactive
					board.BoardStatus = &inactiveStatus
					if err := s.db.GetDb().Save(board).Error; err != nil {
						log.Printf("Error updating board status to offline for %s: %v", board.BoardID, err)
						continue
					}
					log.Printf("Marked board %s as OFFLINE", board.BoardID)
					s.BroadcastStatus(board)
				}
			}
		}
	}
}
