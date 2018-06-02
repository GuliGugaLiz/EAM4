package proto

import (
	"bytes"
	_ "fmt"
	"strconv"
	"strings"
)

type DataProto struct {
	Command   string            // command name
	SessionId uint32            // file session
	Buffer    []byte            // from socket
	Values    map[string]string // command head
	Data      []byte            // data part
}

func (dp *DataProto) GetErrResponse(msg string, d map[string]string) string {
	dict := map[string]string{
		"Result": "NAC",
	}
	if msg != "" {
		dict["Message"] = msg
	}
	if d != nil {
		for k, v := range d {
			dict[k] = v
		}
	}
	return dp.FormatResponse(dict)
}

func (dp *DataProto) CheckFileSession(code string) (bool, string) {
	fsession := dp.Values["filesession"]
	var sid uint32 = 0
	msg := ""
	if fsession == "" {
		msg = "FileSession is empty"
	} else {
		sid64, err := strconv.ParseUint(fsession, 10, 32)
		if err != nil {
			msg = "FileSession is invalid"
		} else {
			sid = uint32(sid64)
		}
	}
	if msg != "" {
		return false, dp.GetErrResponse(msg, map[string]string{
			"Code": code,
		})
	}
	dp.SessionId = sid
	return true, ""
}

func (dp *DataProto) format(tname string, d map[string]string) string {
	s := "[" + tname + "]\r\n" +
		"Command=" + dp.Command + "\r\n"
	if dp.SessionId > 0 {
		s1 := strconv.FormatUint(uint64(dp.SessionId), 10)
		s = s + "FileSession=" + s1 + "\r\n"
	}
	for k, v := range d {
		s = s + k + "=" + v + "\r\n"
	}
	s = s + "\r\n"
	return s
}

func NewRequest(command string) *DataProto {
	d := DataProto{
		Command: command,
	}
	return &d
}

func (dp *DataProto) FormatRequest(d map[string]string) string {
	return dp.format("Request", d)
}

func (dp *DataProto) FormatResponse(d map[string]string) string {
	return dp.format("Response", d)
}

func New(buf []byte) *DataProto {
	d := DataProto{
		Buffer: buf,
	}

	// get command part
	bufs := bytes.Split(buf,
		[]byte{'\r', '\n', '\r', '\n'})
	if len(bufs) > 1 {
		d.Data = bufs[1]
	}
	if len(bufs) > 0 {
		s := string(bufs[0])
		dict := make(map[string]string)
		for _, item := range strings.Split(s, "\r\n") {
			vals := strings.Split(item, "=")
			length := len(vals)
			if length > 1 {
				key := strings.ToLower(vals[0])
				if key == "command" {
					d.Command = vals[1]
				} else {
					dict[key] = vals[1]
				}
				/*		} else if length == 1 && len(item) > 2 {
						if strings.HasPrefix(item, "[") &&
							strings.HasSuffix(item, "]") {
							d.CommandType = strings.ToLower(item[1 : len(item)-1])
						}*/
			}
		}
		d.Values = dict
	}
	return &d
}
