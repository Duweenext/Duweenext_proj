package utils

import (
	"main/config"
	"time"

	"github.com/golang-jwt/jwt/v5"
)

func GenerateJWT(userID uint) (string, error) {
	conf := config.GetConfig()
	claims := jwt.MapClaims{
		"user_id": userID,
		"exp":     time.Now().Add(time.Hour * 24).Unix(), // 1-day expiry
	}
	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	return token.SignedString([]byte(conf.Server.JwtSecret))
}
