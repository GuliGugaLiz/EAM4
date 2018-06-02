package proto

import (
	"time"
)

type Tag struct {
	ReaderId   string
	EPC        string
	RSSI       int
	Ant        int
	InvCount   int
	Freq       float32
	FirstFound *time.Time // first found it
	LastCheck  *time.Time // time when foud
	Lost       *time.Time `json:"Lost,omitempty"` //time when not foud
}
