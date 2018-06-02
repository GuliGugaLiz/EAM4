package model

import (
	"time"
)

type User struct {
	tableName     struct{}   `sql:"user"`
	Id            int64      //Id
	Account       string     `sql:",type:varchar(50),unique,notnull"`   // account
	Password      string     `json:"-" sql:",type:varchar(50),notnull"` // password
	Role          string     `sql:",type:varchar(20),notnull"`          // role
	Name          string     `sql:",type:varchar(20),notnull"`          // nick name
	Email         string     `sql:",type:varchar(50),unique,notnull"`   // email
	Phone         string     `sql:",type:varchar(50)"`                  // phone
	Memo          string     `sql:",type:varchar(500)"`                 // memo
	CreateTime    time.Time  `sql:",notnull"`                           // create time
	LastLoginTime *time.Time // last login time
	LastIpAddr    string     `sql:",type:varchar(30)"` // last login address
}

// for view
type UserRow struct {
	Id            int64
	Account       string
	Role          string
	Name          string
	Email         string
	Phone         string
	Memo          string
	CreateTime    time.Time
	LastLoginTime time.Time
	LastIpAddr    string
}
