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
    migrate(db)
}

func migrate(db database.Database) {
    gormDB := db.GetDb()

    err := gormDB.AutoMigrate(&entities.Education{})
    if err != nil {
        log.Fatalf("Failed to migrate Education: %v", err)
        return
    }
    log.Println("Migrated Education")

    err = gormDB.AutoMigrate(&entities.User{})
    if err != nil {
        log.Fatalf("Failed to migrate User: %v", err)
        return
    }
    log.Println("Migrated User")

    err = gormDB.AutoMigrate(&entities.Board{})
    if err != nil {
        log.Fatalf("Failed to migrate Board: %v", err)
        return
    }
    log.Println("Migrated Board")

    err = gormDB.AutoMigrate(&entities.PondHealth{})
    if err != nil {
        log.Fatalf("Failed to migrate PondHealth: %v", err)
        return
    }
    log.Println("Migrated PondHealth")

    err = gormDB.AutoMigrate(&entities.Sensor{})
    if err != nil {
        log.Fatalf("Failed to migrate Sensor: %v", err)
        return
    }
    log.Println("Migrated Sensor")

    err = gormDB.AutoMigrate(&entities.BoardRelationship{})
    if err != nil {
        log.Fatalf("Failed to migrate BoardRelationship: %v", err)
        return
    }
    log.Println("Migrated BoardRelationship")

    err = gormDB.AutoMigrate(&entities.SensorLog{})
    if err != nil {
        log.Fatalf("Failed to migrate SensorLog: %v", err)
        return
    }
    log.Println("Migrated sensorLog") 

}
