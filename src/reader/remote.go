package reader

import (
	"bytes"
	"compress/gzip"
	"errors"
	"fmt"
	"log"
	"net"
	"proto"
	"strconv"
	"strings"
	"time"
	"utils"
)

//heart beat and send data to remote

func SendHeartBeat(host string, port int,
	devId string, readerIds []string) error {
	remote := fmt.Sprintf("%s:%d", host, port)
	conn, err := net.DialTimeout("tcp", remote, 30*time.Second)
	if err != nil {
		return err
	}
	defer conn.Close()
	dp := proto.NewRequest("HeartBeat")
	time := time.Now().UTC().Unix()
	req := dp.FormatRequest(map[string]string{
		"Guid":      devId,
		"ReaderIds": strings.Join(readerIds, ","),
		"Time":      fmt.Sprintf("%d", time),
	})

	log.Printf("%s\n", req)
	if _, err = utils.ConnWrite(conn, req); err != nil {
		return err
	}

	remoteAddr := conn.RemoteAddr().String()
	_ = remoteAddr
	data, err := utils.ConnRead(conn)
	if err != nil {
		return err
	}
	dp = proto.New(data)
	if dp.Values["result"] != "AC" {
		return errors.New(fmt.Sprintf(
			"remote response: %s", dp.Values["message"]))
	} else {
		return nil
	}
}

func SendToRemote(host string, port int,
	tagCount int, devId string, readerIds []string,
	haveUpdate bool, fileName string,
	json []byte, jsonAll []byte) (bool, error) {
	sendAll := false
	remote := fmt.Sprintf("%s:%d", host, port)
	conn, err := net.DialTimeout("tcp", remote, 30*time.Second)
	if err != nil {
		return false, err
	}
	defer conn.Close()
	dp := proto.NewRequest("FileUpload")
	sTagCount := fmt.Sprintf("%d", tagCount)
	req := dp.FormatRequest(map[string]string{
		"FileName": fileName,
		"Guid":     devId,
		"TagCount": sTagCount,
	})
	if !haveUpdate {
		req = dp.FormatRequest(map[string]string{
			"NoUpdate": "1",
			"FileName": fileName,
			"Guid":     devId,
			"TagCount": sTagCount,
		})
	}

	log.Printf("%s\n", req)
	if _, err = utils.ConnWrite(conn, req); err != nil {
		return false, err
	}
	data := json

	remoteAddr := conn.RemoteAddr().String()
	_ = remoteAddr
	readData, err := utils.ConnRead(conn)
	if err != nil {
		return false, err
	}
	dp = proto.New(readData)
	//command := strings.ToLower(dp.Command)
	if dp.Values["result"] != "AC" {
		return false, errors.New(fmt.Sprintf(
			"remote response: %s", dp.Values["message"]))
	} else {
		allData := dp.Values["alldata"] == "1"
		if allData { // server request all data
			data = jsonAll
			log.Println("server need all data, use jsonAll")
			sendAll = true
		} else {
			if !haveUpdate {
				return false, nil
			}
		}
	}
	if ok, resp := dp.CheckFileSession("5"); !ok {
		return false, errors.New(resp)
	}
	total := len(data)
	stotal := strconv.FormatUint(uint64(total), 10)
	sid := dp.SessionId
	//sendfile
	bufSize := 20480
	idx := 0
	for idx < total {
		isz := idx + bufSize
		if isz > total {
			isz = total
		}
		jsonData := data[idx:isz]
		//filedata
		dp = proto.NewRequest("FileData")
		dp.SessionId = sid
		sidx := strconv.FormatUint(uint64(idx), 10)
		req := dp.FormatRequest(map[string]string{
			"Zip":      "1",
			"Position": sidx,
		})
		var buf bytes.Buffer
		zw := gzip.NewWriter(&buf)
		if _, err = zw.Write(jsonData); err != nil {
			return false, err
		}
		zw.Close()
		zbuf := buf.Bytes()
		log.Printf("%s\n", req)
		log.Printf("data size:%d\n", len(zbuf))
		if _, err = utils.ConnWriteData(conn, req, zbuf); err != nil {
			return false, err
		}
		if resp, err := utils.ConnRead(conn); err != nil {
			return false, err
		} else {
			dp = proto.New(resp)
			if dp.Values["result"] != "AC" {
				return false, errors.New(fmt.Sprintf(
					"remote response: %s", dp.Values["message"]))
			}
		}
		idx = isz
	}
	//send eof
	dp = proto.NewRequest("FileEOF")
	dp.SessionId = sid
	req = dp.FormatRequest(map[string]string{
		"FileName":  fileName,
		"Guid":      devId,
		"ReaderIds": strings.Join(readerIds, ","),
		"FileSize":  stotal,
	})
	log.Printf("%s\n", req)
	if _, err = utils.ConnWrite(conn, req); err != nil {
		return false, err
	}
	if buf, err := utils.ConnRead(conn); err != nil {
		return false, err
	} else {
		dp = proto.New(buf)
		if "AC" != dp.Values["result"] {
			return false, errors.New(fmt.Sprintf(
				"remote response: %s", dp.Values["message"]))
		} else {
			return sendAll, nil
		}
	}
}
