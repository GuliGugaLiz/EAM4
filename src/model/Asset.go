package model

import (
	"time"
)

//ClassName       string   `sql:",type:varchar(50)"`          //class

type Asset struct {
	tableName       struct{}   `sql:"asset"`
	Id              int64      //Id
	EPC             string     `sql:",null,unique,type:varchar(80)"`
	Name            string     `sql:",notnull,type:varchar(200)"` //name
	ClassId         *int64     `sql:",notnull"`                   //classCode
	DeptId          *int64     `sql:",notnull"`                   //department
	BodyNumber      string     `sql:",type:varchar(50)"`          //
	Brand           string     `sql:",type:varchar(50)"`
	Model           string     `sql:",type:varchar(50)"` //
	Configure       string     `sql:",type:varchar(50)"` //
	PurchaseDate    *time.Time `sql:",null"`
	PurchaseValue   *float64   `sql:",null"`
	CurrentValue    *float64   `sql:",null"`
	Warranty        *int32     `sql:",null"`
	Supplier        string     `sql:",type:varchar(50)"`
	Source          string     `sql:",type:varchar(50)"`
	SiteId          int64      `sql:",null"`
	InNetTime       *time.Time `sql:",null"`
	TagId           int64      `sql:",null"`
	StorageLocation string     `sql:",type:varchar(100)"`
	UseStateId      int16      `sql:",notnull"` //notuse=0, inuse=1, repair=2
	Maintainer      string     `sql:",type:varchar(50)"`
	User            string     `sql:",type:varchar(50)"`
	Memo            string     `sql:",type:varchar(500)"`
	CreateAccount   string     `sql:",type:varchar(50),notnull"`
	CreateTime      time.Time  `sql:",notnull"`

	AssetDeptName  string `sql:"_"` // view only
	AssetClassName string `sql:"-"` // view only
}
