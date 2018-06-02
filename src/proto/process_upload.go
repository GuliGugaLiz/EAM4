package proto

import (
	"fmt"
	"github.com/go-pg/pg"
	"log"
	"path"
	"strconv"
	"strings"
	"utils"
)

// data upload handle

const InvalidFileChars = "\\/:*?\"<>|"
const SavePath = "data/"

func UploadRequest(dp *DataProto, db *pg.DB) (bool, string) {
	msg := ""
	guid := dp.Values["guid"]
	filename := dp.Values["filename"]
	if guid == "" && filename == "" {
		msg = "guid and filename is empty"
	} else if guid == "" {
		msg = "guid is empty"
	} else if filename == "" {
		msg = "filename is empty"
	} else {
		if strings.ContainsAny(guid, InvalidFileChars) {
			msg = "guid contains invalid char"
		} else if strings.ContainsAny(filename, InvalidFileChars) {
			msg = "fileName contains invalid char"
		} else if strings.HasSuffix(filename, "._tmp") {
			msg = "fileName can not ends with ._tmp"
		}
	}
	if msg != "" {
		return false, dp.GetErrResponse(msg, nil)
	}
	tagCountStr := dp.Values["tagcount"]
	tagCount := int64(-1)
	if tagCountStr != "" {
		if count, err := strconv.ParseInt(tagCountStr, 10, 64); err == nil {
			tagCount = count
		}
	}
	fpath := path.Join(SavePath, guid, filename)
	ftmp := fpath + "._tmp"
	ok, _, fi := utils.PathExists(fpath) // Check File exists, if done?
	if ok {
		resp := dp.FormatResponse(map[string]string{
			"Result":   "NAC",
			"FileName": filename,
			"Size":     "-1",
			"Message":  "file already upload.",
		})
		return true, resp // file upload done
	} else {
		// check is new device(new reader)
		var total int
		var sql = `select count(*) from "device" 
        where device_guid = ? and last_upload is not null `
		allData := "0"
		if _, err := db.QueryOne(&total, sql, guid); err != nil {
			log.Println(err)
		} else {
			if total == 0 {
				allData = "1" // ask device to upload all instock tag
				log.Printf("device[%s] need to all tags\n", guid)
				if tagCount > -1 {
					sql := `
insert into device(device_guid, tag_count) 
    values( ?, ?)
ON conflict(device_guid) 
DO UPDATE SET tag_count = ?
    , device_guid = ?
            `
					if _, err := db.Exec(sql, guid,
						tagCount, tagCount, guid); err != nil {
						msg = fmt.Sprintf("save tag_count to db got error:%s", err)
						log.Println(err)
					}
				}
			} else {
				if tagCount > -1 {
					db.Exec(` update device set tag_count = ? 
where device_guid = ? `,
						tagCount, guid)
				}
			}
		}

		if dp.Values["noupdate"] == "1" {
			if allData != "1" {
				// nothing to update but log to db
				resp := dp.FormatResponse(map[string]string{
					"Result": "AC",
				})
				return true, resp
			}
		}
		ok, _, fi = utils.PathExists(ftmp)
		var sz int64 = 0
		sid := GetFileSessionId(ftmp)
		msg := ""
		if ok {
			sz = fi.Size() // fie uploading
			msg = fmt.Sprintf(
				"Start upload exists file: %s, Position: %d", filename, sz)
		} else {
			// not exists can upload
			msg = fmt.Sprintf(
				"Start upload new file: %s, Position: %d", filename, sz)
		}
		dp.SessionId = sid

		if allData == "1" {
			sz = 0
		}

		resp := dp.FormatResponse(map[string]string{
			"FileName": filename,
			"Result":   "AC",
			"AllData":  allData,
			"Size":     strconv.FormatInt(sz, 10),
			"Message":  msg,
		})
		return true, resp
	}
}
