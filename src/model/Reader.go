package model

import (
	"time"
)

type Reader struct {
	tableName     struct{}   `sql:"reader"`
	Id            int64      //Id
	ReaderId      string     `sql:",type:varchar(50),unique,notnull"` // reader id
	DeviceGuid    string     `sql:",type:varchar(50),null"`           // dev Guid
	SiteId        int64      `sql:",null"`
	TagCount      int64      `sql:",null"`              // current tag count
	Memo          string     `sql:",type:varchar(500)"` // memo
	CreateTime    time.Time  `sql:",notnull"`
	LastHeartBeat *time.Time `sql:",null"`
	LastUpload    *time.Time `sql:",null"`

	SiteName string `sql:"-"`
}
