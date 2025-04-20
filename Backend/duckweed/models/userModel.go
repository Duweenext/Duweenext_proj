package models

type AddUserData struct {
  UserName    string `json:"username"`
  Email       string `json:"email"`
  PhoneNumber string `json:"phonenumber"`
  Password    string `json:"password"`
}