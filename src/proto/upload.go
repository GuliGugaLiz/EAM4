package proto

import (
	"time"
)

type Upload struct {
	DevId     string
	Add       []Tag `json:"Add,omitempty"`
	Lost      []Tag `json:"Lost,omitempty"`
	Change    []Tag `json:"Change,omitempty"`
	Current   []Tag `json:"Current,omitempty"` //when not send use it
	CheckTime *time.Time
}
