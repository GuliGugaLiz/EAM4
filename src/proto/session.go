package proto

import (
	"math/rand"
	"sync"
	"time"
)

type fileItem struct {
	FilePath string
	Active   time.Time
	Create   time.Time
}

var uploading map[uint32]fileItem
var rw sync.Mutex

func init() {
	//init file sessionId
	uploading = make(map[uint32]fileItem)
	rand.Seed(time.Now().UnixNano())
}

func GetFileSessionId(fpath string) uint32 {
	rw.Lock()
	sid := rand.Uint32()
	_, ok := uploading[sid]
	for ok {
		sid = rand.Uint32()
		_, ok = uploading[sid]
	}
	uploading[sid] = fileItem{
		FilePath: fpath,
		Create:   time.Now().UTC(),
	}
	rw.Unlock()
	return sid
}

func GetFileNameFromSessionId(sid uint32) (bool, string) {
	rw.Lock()
	item, ok := uploading[sid]
	if ok {
		item.Active = time.Now().UTC()
		rw.Unlock()
		return true, item.FilePath
	}
	rw.Unlock()
	return false, ""
}
