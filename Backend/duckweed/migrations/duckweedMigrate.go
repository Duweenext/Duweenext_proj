package main

import (
	"log"
	"main/config"
	"main/database"
	"main/duckweed/entities"
	// "time"
)

func main() {
	conf := config.GetConfig()
	db := database.NewPostgresDatabase(conf)
	migrate(db)
}

func migrate(db database.Database) {
    gormDB := db.GetDb()

    // 1. Migrate Education
    err := gormDB.AutoMigrate(&entities.Education{})
    if err != nil {
        log.Fatalf("Failed to migrate Education: %v", err)
        return // Stop if migration fails
    }
    log.Println("Migrated Education")

    // 2. Migrate User
    err = gormDB.AutoMigrate(&entities.User{})
    if err != nil {
        log.Fatalf("Failed to migrate User: %v", err)
        return // Stop if migration fails
    }
    log.Println("Migrated User")

    // 3. Migrate Board
    err = gormDB.AutoMigrate(&entities.Board{})
    if err != nil {
        log.Fatalf("Failed to migrate Board: %v", err)
        return // Stop if migration fails
    }
    log.Println("Migrated Board")

    // 4. Migrate PondHealth
    err = gormDB.AutoMigrate(&entities.PondHealth{})
    if err != nil {
        log.Fatalf("Failed to migrate PondHealth: %v", err)
        return // Stop if migration fails
    }
    log.Println("Migrated PondHealth")

    // 5. Migrate Sensor
    err = gormDB.AutoMigrate(&entities.Sensor{})
    if err != nil {
        log.Fatalf("Failed to migrate Sensor: %v", err)
        return // Stop if migration fails
    }
    log.Println("Migrated BoardRelationship")

        // 5. Migrate Sensor
        err = gormDB.AutoMigrate(&entities.BoardRelationship{})
        if err != nil {
            log.Fatalf("Failed to migrate BoardRelationship: %v", err)
            return // Stop if migration fails
        }
        log.Println("Migrated BoardRelationship")

}

