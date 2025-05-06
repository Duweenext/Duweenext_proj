package config

import (
  "strings"
  "sync"
  
  "github.com/spf13/viper"
)

type (
  Config struct {
    Server *Server
    Db     *Db
    MQTT   *MQTT 
  }
  
  Server struct {
    Port int
  }
  
  Db struct {
    Host     string
    Port     int
    User     string
    Password string
    DBName   string
    TimeZone string
  }

  MQTT struct { // Define MQTT configuration struct
		BrokerURL string
		ClientID  string
    TopicTelemetry string
    TopicStatus string
	}
)

var (
  once           sync.Once
  configInstance *Config
)

func GetConfig() *Config {
  once.Do(func() {
    viper.SetConfigName("config")
    viper.SetConfigType("yaml")
    // for local migrations
    // viper.AddConfigPath("../..") 
    // use for main running
    viper.AddConfigPath("./")
    viper.AutomaticEnv()
    viper.SetEnvKeyReplacer(strings.NewReplacer(".", "_"))
    
    if err := viper.ReadInConfig(); err != nil {
      panic(err)
    }
    
    if err := viper.Unmarshal(&configInstance); err != nil {
      panic(err)
    }
  })
  
  return configInstance
}