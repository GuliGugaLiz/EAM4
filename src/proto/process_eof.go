package proto

import (
	"fmt"
	"github.com/go-pg/pg"
	"io/ioutil"
	"log"
	"model"
	"net"
	"os"
	"path"
	"strconv"
	"strings"
	"time"
	"utils"
)

func EofRequest(remote net.Addr,
	dp *DataProto, db *pg.DB) (bool, string) {
	msg := ""
	guid := dp.Values["guid"]
	filename := dp.Values["filename"]
	filesize := dp.Values["filesize"]
	readerIds := dp.Values["readerids"]
	var sz int64 = 0
	if filesize == "" {
		msg = "FileSize is empty"
	} else {
		var err error
		sz, err = strconv.ParseInt(filesize, 10, 64)
		if err != nil {
			msg = "FileSize is invalid"
		} else {
			if guid == "" && filename == "" {
				msg = "Guid and FileName is empty"
			} else if guid == "" {
				msg = "Guid is empty"
			} else if guid == "" {
				msg = "FileName is empty"
			} else {
				if strings.ContainsAny(guid, InvalidFileChars) {
					msg = "Guid contains invalid char"
				} else if strings.ContainsAny(filename, InvalidFileChars) {
					msg = "FileName contains invalid char"
				} else if strings.HasSuffix(filename, "._tmp") {
					msg = "FileName can not ends with ._tmp"
				}
			}
		}
	}
	if msg != "" {
		return false, dp.GetErrResponse(msg, nil)
	}
	fname := path.Join(SavePath, guid, filename)
	ftmp := fname + "._tmp"
	ok, fpath := GetFileNameFromSessionId(dp.SessionId)
	if !ok {
		msg = "File not exists in session"
	} else {
		if ftmp != fpath {
			msg = "filename not exists."
			return false, dp.GetErrResponse(msg, nil)
		}
	}
	ok, _, fi := utils.PathExists(fpath) // Check File exists, if done?
	if !ok {
		msg = "File not found!"
		return false, dp.GetErrResponse(msg, map[string]string{
			"FileName": filename,
			"Code":     "3",
		})
	} else {
		sz1 := fi.Size()
		if sz1 != sz {
			msg = fmt.Sprintf("FileEof Size Error!Request FileSize:%d;Server FileSize:%d;",
				sz, sz1)
			return false, dp.GetErrResponse(msg, map[string]string{
				"FileName": filename,
				"Code":     "2",
			})
		} else {
			err := os.Rename(ftmp, fname)
			if err != nil {
				msg = "server rename file got error."
			} else { // save to db
				data, _ := ioutil.ReadFile(fname)
				now := time.Now().UTC() // record to db
				hb := &model.DeviceFile{
					DeviceGuid: guid,
					FilePath:   fname,
					Size:       sz,
					Data:       data,
					CreateTime: now,
					IpAddr:     remote.String(),
				}
				sql := `
insert into device(device_guid, last_upload) 
    values( ?, ?)
ON conflict(device_guid) 
DO UPDATE SET 
    last_upload = ? 
    ,device_guid = ?
            `
				if _, err := db.Exec(sql, guid, now, now, guid); err != nil {
					msg = fmt.Sprintf("file info save to db got error:%s", err)
					log.Println(err)
				}
				stateJson, epcsStr := runTagData(data, db)
				hb.TagState = stateJson
				hb.ChangeConflictEPC = epcsStr
				if err := db.Insert(hb); err != nil {
					msg = fmt.Sprintf("file info save to db got error:%s", err)
					log.Println(err)
				} else {
					log.Printf("device[%s] upload file: %s.", guid, fname)
				}
				for _, readerId := range strings.Split(readerIds, ",") {
					if readerId != "" {
						updateReaderUpload(readerId, guid, db)
					}
				}
			}
		}
	}
	if msg != "" {
		return false, dp.GetErrResponse(msg, nil)
	}
	resp := dp.FormatResponse(map[string]string{
		"FileName": filename,
		"Result":   "AC",
		"FileSize": strconv.FormatInt(sz, 10),
		"Code":     "0",
		"Message":  "FileEof Done.",
	})
	return true, resp
}

func updateReaderUpload(readerId string, guid string, db *pg.DB) {
	now := time.Now().UTC() // record to db
	sql := `
insert into reader(reader_id, device_guid, 
    last_upload, create_time) 
    values(?, ?, ?, ?)
ON conflict(reader_id) 
DO UPDATE SET 
    last_upload = ? 
    ,reader_id = ?
            `
	if _, err := db.Exec(sql, readerId, guid,
		now, now, now, readerId); err != nil {
		msg := fmt.Sprintf("save to db got error:%s", err)
		log.Println(msg)
	}
}
