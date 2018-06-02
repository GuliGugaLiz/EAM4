package handler

import (
	"crypto/md5"
	"errors"
	"fmt"
	jwt_lib "github.com/dgrijalva/jwt-go"
	"github.com/gin-gonic/gin"
	"github.com/go-pg/pg"
	"jwt"
	"log"
	"model"
	"strings"
	"time"
)

var db *pg.DB

func InitDB(d *pg.DB) {
	db = d
}

var (
	secret = "c7f0244b-c4cb-4aa2-9d8d-cf4bd3d06a26"
)

func InitHandler(e *gin.Engine, r *gin.RouterGroup) {
	r.POST("/login", login)
	r.GET("/devicefile/download", downDeviceFile)

	r.Use(jwt.Auth(secret))

	InitLogin(e, r)
	InitDashboard(e, r)
	InitUser(e, r)
	InitAsset(e, r)
	InitChange(e, r)
	InitDevice(e, r)

	InitMaintainer(e, r)
	InitReader(e, r)
	InitSite(e, r)
	InitTag(e, r)
}

func Md5WithHash(val string) string {
	data := []byte(val + secret)
	return fmt.Sprintf("%x", md5.Sum(data))
}

func InitLogin(e *gin.Engine, r *gin.RouterGroup) {
	r.GET("/user/current", currentUser)
}

type loginModel struct {
	User      string `json:"user"`
	Pwd       string `json:"pwd"`
	Stype     string `json:"stype"`
	AutoLogin bool   `json:"autoLogin"`
}

func login(c *gin.Context) {
	var m loginModel
	c.Bind(&m)
	var user model.User
	pwd := Md5WithHash(m.Pwd)
	if _, err := db.QueryOne(&user,
		`select * from "user" where account = ? `,
		strings.ToLower(m.User)); err != nil {
		log.Println(err)
		c.JSON(200, gin.H{
			"status":  "error",
			"message": "account or password error",
		})
		return
	} else if user.Password != pwd {
		c.JSON(200, gin.H{
			"status":  "error",
			"message": "account or password error",
		})
		return
	}

	token := jwt_lib.New(jwt_lib.GetSigningMethod("HS256"))
	token.Claims = jwt_lib.MapClaims{
		"Id":  user.Id,
		"exp": time.Now().Add(time.Hour * 8).Unix(),
	}
	tokenString, err := token.SignedString([]byte(secret))
	if err != nil {
		c.JSON(200, gin.H{
			"status":  "error",
			"message": "Could not generate token",
		})
		return
	}
	c.JSON(200, gin.H{
		"status":           "ok",
		"type":             "account",
		"currentAuthority": user.Role,
		"token":            tokenString,
	})
}

func getCurrentUser(c *gin.Context) (*model.User, error) {
	var claims jwt_lib.MapClaims
	tokenString := c.Request.Header.Get("Authorization")
	if _, err := jwt_lib.ParseWithClaims(tokenString, &claims,
		func(token *jwt_lib.Token) (interface{}, error) {
			return []byte(secret), nil
		}); err != nil {
		log.Println("tokenString err:", err)
		return nil, errors.New("token is invalid1")
	}
	if uid, ok := claims["Id"]; !ok {
		return nil, errors.New("token is invalid3")
	} else {
		var user model.User
		if _, err := db.QueryOne(&user,
			`select * from "user" where id= ? `, uid); err != nil {
			return nil, errors.New("token is invalid4")
		}
		log.Println("Authorization:", user.Account)
		return &user, nil
	}
}

func currentUser(c *gin.Context) {
	if user, err := getCurrentUser(c); err != nil {
		log.Println(err)
		c.JSON(401, gin.H{
			"status": "error",
		})
	} else {
		c.JSON(200, gin.H{
			"name":   user.Name,
			"userid": user.Id,
		})
	}
}
