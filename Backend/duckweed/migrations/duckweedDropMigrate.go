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

	// if err:= gormDB.Migrator().DropTable(&entities.Board{}); err != nil {
	// 	log.Fatalf("Failed to drop table Board: %v", err)

	// }
	// log.Println("Dropped table: Board")
	// Now you can safely drop the Board table.
	// if err := gormDB.Migrator().DropTable(&entities.Board{}); err != nil {
	// 	log.Fatalf("Failed to drop table Board: %v", err)
	// }
	// log.Println("Dropped table: Board")

	// You can add your AutoMigrate calls here to recreate the tables.
	// Example:
	// if err := gormDB.AutoMigrate(&entities.Board{}, &entities.BoardRelationship{}); err != nil {
	// 	log.Fatalf("Failed to migrate tables: %v", err)
	// }
	// log.Println("Successfully migrated tables.")
}
