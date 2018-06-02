package model

import (
	"time"
)

type AssetRepair struct {
	tableName  struct{}  `sql:"asset_Repair"`
	Id         int64     //Id
	TagId      int64     //
	EPC        string    `sql:",type:varchar(80),notnull"`
	AssetId    int64     //
	CreateTime time.Time `sql:",notnull"`
	Memo       string    `sql:"type:varchar(500)"`
}
