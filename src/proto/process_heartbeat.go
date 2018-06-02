package proto

import (
	"fmt"
	"github.com/go-pg/pg"
	"log"
	"model"
	"net"
	"strconv"
	"strings"
	"time"
)

func HeartBeat(remote net.Addr,
	dp *DataProto, db *pg.DB) (bool, string) {
	msg := ""
	guid := dp.Values["guid"]
	times := dp.Values["time"]
	readerIds := dp.Values["readerids"]
	var hbTime time.Time
	if guid == "" && times == "" {
		msg = "guid and time is empty"
	} else if guid == "" {
		msg = "guid is empty"
	} else if times == "" {
		msg = "time is empty"
	} else {
		if i, err := strconv.ParseInt(times, 10, 64); err != nil {
			msg = "time is invalid"
		} else {
			hbTime = time.Unix(i, 0)

			now := time.Now().UTC() // record to db
			hb := &model.DeviceHeartBeat{
				DeviceGuid:    guid,
				HeartBeatTime: hbTime,
				CreateTime:    now,
				IpAddr:        remote.String(),
			}
			sql := `
insert into device(device_guid, last_heart_beat) 
    values( ?, ?)
ON conflict(device_guid) 
DO UPDATE SET 
    last_heart_beat = ? 
    ,device_guid = ?
            `
			if _, err := db.Exec(sql, guid,
				now, now, guid); err != nil {
				msg = fmt.Sprintf("save to db got error:%s", err)
				log.Println(err)
			}
			if err := db.Insert(hb); err != nil {
				msg = fmt.Sprintf("save to db got error:%s", err)
				log.Println(err)
			} else {
				log.Printf("device[%s] heartbeat @ %s.", guid, time.Now())
			}

			for _, readerId := range strings.Split(readerIds, ",") {
				if readerId != "" {
					updateReader(readerId, guid, db)
				}
			}
		}
	}
	if msg != "" {
		return false, dp.GetErrResponse(msg, nil)
	}
	resp := dp.FormatResponse(map[string]string{
		"Result": "AC",
	})
	return true, resp
}

func updateReader(readerId string, guid string, db *pg.DB) {
	now := time.Now().UTC() // record to db
	sql := `
insert into reader(reader_id, device_guid, last_heart_beat, create_time) 
    values( ?, ?, ?, ?)
ON conflict(reader_id) 
DO UPDATE SET 
    last_heart_beat = ? 
    , reader_id = ?
            `
	if _, err := db.Exec(sql, readerId, guid,
		now, now, now, readerId); err != nil {
		msg := fmt.Sprintf("save to db got error:%s", err)
		log.Println(msg)
	}

}
