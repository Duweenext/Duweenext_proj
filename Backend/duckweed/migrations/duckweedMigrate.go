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

    // err := gormDB.Migrator().DropColumn(&entities.Education{}, "id")
    // gormDB.Migrator().DropColumn(&entities.Board{}, "id")
    // gormDB.Migrator().DropColumn(&entities.User{}, "id")
    // gormDB.Migrator().DropColumn(&entities.PondHealth{}, "id")
    // gormDB.Migrator().DropColumn(&entities.Sensor{}, "id")
    // gormDB.Migrator().DropColumn(&entities.BoardRelationship{}, "id")
    // gormDB.Migrator().DropTable(&entities.BoardStatus{})
    // gormDB.Migrator().DropColumn(&entities.BoardStatus{}, "board_id")
    // if err != nil {
    //     log.Fatalf("failed to drop column: %v", err)
    // }

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

    // 6. Migrate status
    err = gormDB.AutoMigrate(&entities.BoardStatus{})
    if err != nil {
        log.Fatalf("Failed to migrate BoardRelationship: %v", err)
        return // Stop if migration fails
    }
    log.Println("Migrated BoardStatus") 

}

