package main

import (
    "main/config"
    "main/database"
    "main/server"
)

func main() {
    conf := config.GetConfig()
    db := database.NewPostgresDatabase(conf)
    server.NewFiberServer(conf, db).Start()
}