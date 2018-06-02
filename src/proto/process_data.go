package proto

import (
	"bytes"
	"compress/gzip"
	"fmt"
	"io/ioutil"
	"log"
	"os"
	"path/filepath"
	"strconv"
	"utils"
)

func DataRequest(dp *DataProto) (bool, string) {
	zip := dp.Values["zip"] == "1"
	position := dp.Values["position"]
	var (
		msg         = ""
		pos   int64 = 0
		code        = "1"
		fpath       = ""
		ok          = false
		data        = dp.Data
	)
	if position == "" {
		msg = "Position is empty"
		code = "1"
	} else {
		var err error
		pos, err = strconv.ParseInt(position, 10, 64)
		if err != nil {
			msg = "Position is invalid"
			code = "1"
		}
	}
	if data == nil || len(data) == 0 {
		msg = "data is empty"
		code = "6"
	}
	var saveData []byte
	if msg == "" && zip {
		buf := bytes.NewBuffer(data)
		if zr, err := gzip.NewReader(buf); err != nil {
			msg = "zip decode data error"
			code = "2"
		} else {
			if data1, err := ioutil.ReadAll(zr); err != nil {
				msg = "zip read decode data error"
				code = "2"
			} else {
				//log.Printf("====>%d, %d\n", len(data), len(data1))
				saveData = data1
			}
			zr.Close()
		}
	} else {
		saveData = data
	}
	if msg == "" {
		ok, fpath = GetFileNameFromSessionId(dp.SessionId)
		if !ok {
			msg = "File not exists in session"
			code = "5"
		} else if pos > 0 { // is exists file
			ok, _, fi := utils.PathExists(fpath) // Check File exists, if done?
			if !ok {
				msg = "File not found!"
				code = "4" // same write file error
			} else {
				sz1 := fi.Size()
				if sz1 != pos {
					msg = fmt.Sprintf(
						"PositionError!Request Position:%d;Server Position:%d;",
						pos, sz1)
					code = "1"
				}
			}
		} else {
			p := filepath.Dir(fpath)
			log.Println(p)
			if err := os.MkdirAll(p, os.ModePerm); err != nil {
				msg = "server create file path got error." + p
				code = "4"
			}
		}
	}
	if msg == "" {
		f, err := os.OpenFile(fpath,
			os.O_APPEND|os.O_CREATE|os.O_WRONLY, 0644)
		if err != nil {
			msg = "server open file got error."
			code = "4"
		}
		defer f.Close()
		if _, err = f.Write(saveData); err != nil {
			msg = "server write to file got error."
			code = "4"
		}
		//TODO: Update db
	}

	if msg != "" {
		return false, dp.GetErrResponse(msg, map[string]string{
			"Code": code,
		})
	} else {
		return true, dp.GetErrResponse(msg, map[string]string{
			"Result": "AC",
		})
	}
}
