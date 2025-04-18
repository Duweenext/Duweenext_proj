package entities

type Sensor struct {
	SensorID        *uint   `gorm:"primaryKey;autoIncrement"`
	SensorName      *string  
	SensorType      *string  
	SensorStatus    *string  
	SensorThreshold *float64 
	SensorFrequency *int64   
}
