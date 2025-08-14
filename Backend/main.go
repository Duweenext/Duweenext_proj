package main

import (
	"log"
	"main/config"
	"main/database"
	"main/mqtt"
	"main/server"
)

func main() {
	conf := config.GetConfig()
	db := database.NewPostgresDatabase(conf)
	fiberServer := server.NewFiberServer(conf, db)
	mqttClient := mqtt.Initialize(db.GetDb(), conf, fiberServer) // Pass db, conf, and server
	if mqttClient == nil {
		log.Fatalf("MQTT initialization failed") // Exit if MQTT init fails
	}
	defer mqttClient.Disconnect(250)

	go fiberServer.Start() // Start the initialized server
	select {}
}
