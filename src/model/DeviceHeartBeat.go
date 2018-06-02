package model

import (
	"time"
)

type DeviceHeartBeat struct {
	tableName     struct{}  `sql:"device_heartbeat"`
	Id            int64     //Id
	DeviceGuid    string    `sql:",type:varchar(50),notnull"` // device guid
	HeartBeatTime time.Time `sql:",notnull"`                  // heart beat time, is device time
	CreateTime    time.Time `sql:",notnull"`                  // server create log time
	IpAddr        string    `sql:",type:varchar(30),notnull"` // client address
}
