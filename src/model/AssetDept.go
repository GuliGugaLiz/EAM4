package model

import (
	"time"
)

//department
type AssetDept struct {
	tableName     struct{}  `sql:"asset_dept"`
	Id            int64     //Id
	Name          string    `sql:",type:varchar(50),unique,notnull"`
	Memo          string    `sql:",type:varchar(500)"`
	CreateAccount string    `sql:",notnull,type:varchar(50)"`
	CreateTime    time.Time `sql:",notnull"`
}
