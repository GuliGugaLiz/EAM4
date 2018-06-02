package model

import (
	"time"
)

type Site struct {
	tableName     struct{}  `sql:"site"`
	Id            int64     //Id
	Province      string    `sql:",type:varchar(50),notnull"`
	City          string    `sql:",type:varchar(50),notnull"`
	District      string    `sql:",type:varchar(50),null"`
	Name          string    `sql:",type:varchar(50),notnull"`
	Address       string    `sql:",type:varchar(200),null"`
	Lng           float64   `sql:",notnull"`
	Lat           float64   `sql:",notnull"`
	CreateAccount string    `sql:",type:varchar(50),notnull"`
	CreateTime    time.Time `sql:",notnull"`
	HoldUserId    *int64    `sql:",null"`
	HoldUserName  string    `sql:"-"`
}
