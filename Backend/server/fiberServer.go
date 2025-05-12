package server

import (
	"encoding/json"
	"fmt"
	"log"
	"strconv"
	"sync"
	"time"

	"github.com/gofiber/fiber/v2/middleware/cors"

	"main/config"
	"main/database"
	"main/duckweed/entities"
	"main/duckweed/handlers"
	"main/duckweed/repositories"
	"main/duckweed/usecases"

	"github.com/gofiber/contrib/websocket"
	"github.com/gofiber/fiber/v2"
	"github.com/gofiber/fiber/v2/middleware/logger"
	"github.com/gofiber/fiber/v2/middleware/recover"
)

type FiberServer struct {
	app  *fiber.App
	db   database.Database
	conf *config.Config
	clients map[*websocket.Conn]map[string]bool // map to track connected clients
	mutex sync.Mutex
	wsOutput usecases.WebSocketOutputPort // server itself implement the port
	
}

func NewFiberServer(conf *config.Config, db database.Database) Server {
	fiberApp := fiber.New()

	server := &FiberServer{
		app:     fiberApp,
		db:      db,
		conf:    conf,
		clients: make(map[*websocket.Conn]map[string]bool),
		mutex:   sync.Mutex{},
	}
	server.wsOutput = server // Now it's defined

	return server
}


func (s *FiberServer) Start() {
	s.app.Use(recover.New())
	s.app.Use(logger.New())

	s.app.Get("v1/health", func(c *fiber.Ctx) error {
		return c.SendString("OK")
	})

	s.app.Use(cors.New(cors.Config{
		AllowOrigins:     "http://localhost:8081",
		AllowHeaders:     "Origin, Content-Type, Accept, Authorization",
		AllowCredentials: true,
	}))

	// Repositories
	userRepo := repositories.NewUserRepository(s.db.GetDb())
	// sensorRepo := repositories.NewSensorRepository(s.db.GetDb())
	pondHealthRepo := repositories.NewPondHealthRepository(s.db.GetDb())
	educationRepo := repositories.NewEducationRepository(s.db.GetDb())
	// boardRepo := repositories.NewBoardRepository(s.db.GetDb())

	// Use cases
	userUseCase := usecases.NewUserUseCase(*userRepo)
	// sensorUseCase := usecases.NewSensorUseCase(*sensorRepo)
	pondHealthUseCase := usecases.NewpondHealthUseCase(*pondHealthRepo)
	educationUseCase := usecases.NewEducationUseCase(*educationRepo)
	// boardUseCase := usecases.NewBoardUseCase(*boardRepo)

	// Handlers
	userHandler := handlers.NewUserHandler(userUseCase)
	// sensorHandler := handlers.NewSensorHandler(sensorUseCase)
	pondHealthHandler := handlers.NewPondHealthHandler(pondHealthUseCase)
	educationHandler := handlers.NewEducationHandler(educationUseCase)
	// boardHandler := handlers.NewBoardHandler(boardUseCase)

	// Routes
	api := s.app.Group("/v1")

	// User routes
	// api.Post("/users", userHandler.CreateUser)
	api.Get("/users", userHandler.GetAllUsers)
	api.Get("/users/:id", userHandler.GetUserByID)
	api.Post("/login", userHandler.Login)
	api.Post("/register", userHandler.Register)

	// Sensor routes
	// api.Post("/sensors", sensorHandler.CreateSensor)
	// api.Get("/sensors", sensorHandler.GetAllSensors)
	// api.Get("/sensors/:id", sensorHandler.GetSensorByID)

	// // PondHealth routes
	// api.Post("/pondhealth", pondHealthHandler.CreatePondHealth)
	api.Get("/pondhealth", pondHealthHandler.GetAllPondHealth)
	api.Get("/pondhealth/:id", pondHealthHandler.GetPondHealthByID)
	api.Get("/pondhealthByUserId/:userid", pondHealthHandler.GetPondHealthByUserID)
	api.Post("/PostPondHealth/", pondHealthHandler.PostPondHealth)
	// // Education routes
	// api.Post("/education", educationHandler.CreateEducation)
	api.Get("/education", educationHandler.GetAllEducation)
	api.Get("/education/:id", educationHandler.GetEducationByID)

	// // Board routes
	// api.Post("/boards", boardHandler.CreateBoard)
	// api.Get("/boards", boardHandler.GetAllBoards)
	// api.Get("/boards/:id", boardHandler.GetBoardByID)

	// WebSocket Route
	// api.Get("/ws", s.websocketHandler)
	// in Start():
	api.Get("/ws/:userId/:boardId", s.websocketHandler)


	//

	go s.monitorBoardStatus()
	// Start server
	serverUrl := fmt.Sprintf(":%d", s.conf.Server.Port)
	log.Fatal(s.app.Listen(serverUrl))
}

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

// Method to broadcast data to all users that are subscribed to a board
func (s *FiberServer) BroadcastTelemetryData(boardID string, data *entities.SensorData) {
    s.mutex.Lock()
    defer s.mutex.Unlock()

	    // envelope with a "type" and a "data" field
		envelope := struct {
			Type string               `json:"type"`
			Data *entities.SensorData `json:"data"`
		}{
			Type: "telemetry",
			Data: data,
		}
		payload, err := json.Marshal(envelope)

	// jsonData, err := json.Marshal(data)
	if err != nil {
		log.Println("Error marshaling sensor data:", err)
		return
	}

    for conn, boardMap := range s.clients {
        // Only send telemetry to clients that are subscribed to the specific board
        if _, ok := boardMap[boardID]; ok {
            err := conn.WriteMessage(websocket.TextMessage, payload)
            if err != nil {
                log.Println("Error sending data to client:", err)
                conn.Close()
                delete(s.clients, conn)
            }
        }
    }
}


func (s *FiberServer) BroadcastSensorData(data *entities.SensorData) {
	s.mutex.Lock()
	defer s.mutex.Unlock()

	jsonData, err := json.Marshal(data)
	if err != nil {
		log.Println("Error marshaling sensor data:", err)
		return
	}

	for client := range s.clients {
		err := client.WriteMessage(websocket.TextMessage, jsonData)
		if err != nil {
			log.Println("Broadcast Error:", err)
			client.Close()
			delete(s.clients, client)
		}
	}
}

func (s *FiberServer) BroadcastStatus(status *entities.BoardStatus) {
	s.mutex.Lock()
	defer s.mutex.Unlock()

	jsonData, err := json.Marshal(status)
	if err != nil {
		log.Println("Error marshaling board status:", err)
		return
	}

	for client := range s.clients {
		err := client.WriteMessage(websocket.TextMessage, jsonData)
		if err != nil {
			log.Println("Broadcast Error:", err)
			client.Close()
			delete(s.clients, client)
		}
	}
}

// Function to update the board status to the database
func updateBoardStatus(boardId string, status string, db database.Database) error {
    var boardStatus entities.BoardStatus
    result := db.GetDb().Where("board_id = ?", boardId).First(&boardStatus)
    
    if result.Error != nil {
        // Handle error if no record found
        return result.Error
    }

    // Update the status
    boardStatus.Status = status
    boardStatus.UpdatedAt = time.Now() // Store the last update time
    if err := db.GetDb().Save(&boardStatus).Error; err != nil {
        return err
    }

    log.Printf("Updated Board ID: %s to status: %s", boardId, status)
    return nil
}


func (s *FiberServer) monitorBoardStatus() {
	ticker := time.NewTicker(30 * time.Second) // Check every 30 seconds
	defer ticker.Stop()

	for {
		<-ticker.C
		var boards []entities.BoardStatus
		err := s.db.GetDb().Find(&boards).Error
		if err != nil {
			log.Printf("Error checking board statuses: %v", err)
			continue
		}

		now := time.Now()
		for _, board := range boards {
			if !board.LastSeen.IsZero() && now.Sub(board.LastSeen) > time.Minute && board.Status != "offline" {
				// Mark as offline
				board.Status = "offline"
				board.UpdatedAt = now
				if err := s.db.GetDb().Save(&board).Error; err != nil {
					log.Printf("Error updating board status to offline for %s: %v", board.BoardID, err)
					continue
				}
				log.Printf("Marked board %s as OFFLINE", board.BoardID)
			
				// Also broadcast offline status
				s.BroadcastStatus(&board)
			}
			
		}
	}
}

// check if the connection is good for user 1 and user 2 , if user 1 can see but user 2 cannot see. that mean it work!