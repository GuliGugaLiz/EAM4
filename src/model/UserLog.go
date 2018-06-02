package model

import (
	"time"
)

type UserLog struct {
	tableName  struct{}  `sql:"user_log"`
	Id         int64     // id
	UserId     int64     `sql:",notnull"`
	CreateTime time.Time `sql:",notnull"` // create time
	IpAddr     string    `sql:",notnull"` // client address
}
