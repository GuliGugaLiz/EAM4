package reader

import (
	"time"
)

type Setting struct {
	WebHost            string
	Host               string
	Port               int
	LastUpload         *time.Time
	UploadPreMinute    int
	HeartBeatPreMinute int
}

func GetDefaultSetting() *Setting {
	return &Setting{
		WebHost:            "192.168.3.12",
		Host:               "localhost",
		Port:               9980,
		UploadPreMinute:    12 * 60,
		HeartBeatPreMinute: 3,
	}
}
