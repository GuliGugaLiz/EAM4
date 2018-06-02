package utils

import (
	"encoding/binary"
	"io"
	"log"
	"net"
	"os"
	"path/filepath"
	"time"
)

var APP_DIR = ""
var APP_EXEPATH = ""
var APP_EXENAME = ""

func init() {
	exepath, err := os.Executable()
	if err != nil {
		log.Panic(err)
	}
	APP_EXEPATH = exepath
	APP_DIR = filepath.Dir(exepath)
	APP_EXENAME = filepath.Base(exepath)
}

func PathExists(path string) (bool, error, os.FileInfo) {
	fi, err := os.Stat(path)
	if err == nil {
		return true, nil, fi
	}
	if os.IsNotExist(err) {
		return false, nil, nil
	}
	return false, err, nil
}

func ConnWrite(conn net.Conn, resp string) (int, error) {
	buf := make([]byte, 2)
	binary.BigEndian.PutUint16(buf, uint16(len(resp)))
	conn.SetWriteDeadline(
		time.Now().Add(20 * time.Second))
	n, err := conn.Write(buf)
	if err != nil {
		return n, err
	}
	return conn.Write([]byte(resp))
}

func ConnWriteData(conn net.Conn, resp string, data []byte) (int, error) {
	rdata := []byte(resp)
	sz := len(rdata) + len(data)
	buf := make([]byte, 2)
	binary.BigEndian.PutUint16(buf, uint16(sz))

	conn.SetWriteDeadline(
		time.Now().Add(20 * time.Second))
	if n, err := conn.Write(buf); err != nil {
		return n, err
	}
	if n, err := conn.Write(rdata); err != nil {
		return n, err
	}
	if n, err := conn.Write(data); err != nil {
		return n, err
	}
	return sz, nil
}

func ConnRead(conn net.Conn) ([]byte, error) {
	buf := make([]byte, 2)
	conn.SetReadDeadline(
		time.Now().Add(20 * time.Second))
	if n, err := io.ReadFull(conn, buf); err != nil {
		return nil, err
	} else {
		sz := binary.BigEndian.Uint16(buf[:n])
		data := make([]byte, sz)
		if n, err := io.ReadFull(conn, data); err != nil {
			return nil, err
		} else {
			return data[:n], nil
		}
	}
}
