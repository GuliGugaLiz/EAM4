package model

import (
	"time"
)

type Tag struct {
	tableName  struct{}   `sql:"tag"`
	Id         int64      //Id
	EPC        string     `sql:",unique,type:varchar(80)"`
	AssetId    *int64     `sql:",unique,null"`
	SiteId     *int64     `sql:",null"`
	ReaderId   string     `sql:",type:varchar(50),null"` // reader id
	CreateTime time.Time  `sql:",notnull"`
	LastUpdate *time.Time `sql:",null"`
	LastCheck  *time.Time `sql:",null"`
	Lost       *time.Time `sql:",null"`
	LastAnt    *int16     `sql:",null"`
	LastState  int16      `sql:",notnull"` //unknow=0 instock=1 lost=2

	ConflictReaderId string `sql:",null"` // where state is conflict
}

type TagView struct {
	Tag
	AssetId   *int64
	AssetName string
	SiteId    *int64
	SiteName  string
}
