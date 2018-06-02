package model

import (
	"time"
)

type AssetChange struct {
	tableName       struct{}   `sql:"asset_change"`
	Id              int64      //Id
	EPC             string     `sql:",type:varchar(80),notnull"`
	AssetId         *int64     `sql:",null"`
	CreateTime      time.Time  `sql:",notnull"`
	LastReaderId    string     `sql:",type:varchar(50),notnull"`
	LastSiteId      *int64     `sql:",null"`
	CurrentSiteId   *int64     `sql:",null"`
	CurrentReaderId string     `sql:",type:varchar(50),notnull"`
	CheckUserId     *int64     `sql:",null"`
	IsPass          bool       `sql:",null"`
	PassTime        *time.Time `sql:",null"`
	Memo            string     `sql:"type:varchar(500)"` //(when not pass)

	AssetName        string `sql:"-"`
	LastSiteName     string `sql:"-"`
	CurrentSiteName  string `sql:"-"`
	CheckUserAccount string `sql:"-"`
}
