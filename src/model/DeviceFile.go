package model

import (
	"time"
)

//note: conflict epc is when some epc(with one reader report) in db mark instock
// and is new in other reader

type DeviceFile struct {
	tableName         struct{}  `sql:"device_file"`
	Id                int64     //Id
	DeviceGuid        string    `sql:",type:varchar(50),notnull"`  // dev Guid
	FilePath          string    `sql:",type:varchar(200),notnull"` // file path
	Size              int64     `sql:",notnull"`                   // file size
	Data              []byte    `sql:",notnull"`
	CreateTime        time.Time `sql:",notnull"`                  // upload time
	IpAddr            string    `sql:",type:varchar(30),notnull"` // client address
	TagState          string    `sql:",type:varchar(500),null"`
	ChangeConflictEPC string    `sql:",null"` // when the file got conflict epc
}

type FileTagState struct {
	Add     *int `json:"add,omitempty"`
	Lost    *int `json:"lost,omitempty"`
	Change  *int `json:"change,omitempty"`
	Current *int `json:"current,omitempty"`
}
