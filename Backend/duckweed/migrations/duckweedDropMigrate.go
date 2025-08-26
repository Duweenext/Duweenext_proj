//go:build ignore
package main

import (
	"log"
	"main/config"
	"main/database"
	"main/duckweed/entities"
)

func main() {
	conf := config.GetConfig()
	db := database.NewPostgresDatabase(conf)
	migrateDrop(db)
}

func migrateDrop(db database.Database) {
	gormDB := db.GetDb()

	// Drop the BoardRelationship table first due to the foreign key constraint.
	if err := gormDB.Migrator().DropTable(&entities.Sensor{}); err != nil {
		log.Fatalf("Failed to drop table BoardRelationship: %v", err)
	}
	log.Println("Dropped table: Sensor")
}
