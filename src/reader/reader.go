package reader

import (
	"encoding/binary"
	"encoding/hex"
	"errors"
	"fmt"
	"github.com/tarm/goserial"
	"io"
	"io/ioutil"
	"log"
	"proto"
	"runtime"
	//"strconv"
	"strings"
	"time"
)

const usbserial = "/proc/tty/driver/usbserial"
const ftdiName = "FTDI USB Serial Device"

const comNamePrefix = "/dev/ttyUSB"

//get COM File from file in linux
func GetComFile() (string, error) {
	txt, err := ioutil.ReadFile(usbserial)
	if err != nil {
		return "", err
	}
	lines := strings.Split(string(txt), "\n")
	if len(lines) > 0 {
		for _, line := range lines {
			if strings.Contains(line, ftdiName) {
				for _, it := range strings.Split(line, " ") {
					if strings.HasPrefix(it, "port:") {
						if len(it[5:]) > 0 {
							s1 := comNamePrefix + strings.TrimSpace(it[5:])
							return s1, nil
						}
					}
				}
			}
		}
	}
	return "", errors.New("not found FTDI Serial Device")
}

const config = "/dos/config/software.config"

//get RCU Id from file
func GetRCUId() (string, error) {
	txt, err := ioutil.ReadFile(config)
	if err != nil {
		return "", err
	}
	str := string(txt)
	start := strings.Index(str, "<rcuid>")
	end := strings.Index(str, "</rcuid>")
	if start < 0 || end < 0 {
		return "", errors.New("<rcuid> not found")
	}
	rcuId := str[start+7 : end]

	return rcuId, nil
}

func GetEPCList(sleep int) (string, []proto.Tag, error) {
	var (
		err      error
		comName  string
		readerId string
		ser      io.ReadWriteCloser
	)
	log.Println("getting comname...")
	//get com name
	if comName, err = GetComFile(); err != nil {
		return "", nil, err
	}
	if runtime.GOOS == "windows" {
		comName = "COM3"
	}
	log.Printf("get comName[%s] done.\n", comName)

	//open com
	cfg := &serial.Config{
		Name:        comName,
		ReadTimeout: 30 * time.Second,
		Baud:        115200,
	}
	if ser, err = serial.OpenPort(cfg); err != nil {
		return "", nil, err
	}
	defer ser.Close()

	log.Println("rebooting reader...")
	//reboot reader
	if err = WriteCmdOnly(0x70, ser); err != nil {
		return "", nil, err
	}
	time.Sleep(2 * time.Second)
	log.Println("reboot reader done.")

	//get reader id
	log.Println("getting readerId...")
	if ident, err := WriteCmdSerial3(0x68, ser); err != nil {
		return "", nil, err
	} else {
		readerId = hex.EncodeToString(ident)
	}
	log.Printf("get readerId[%s] done.\n", readerId)

	haveTag := false

	//reset the 4 antenna, every one loop 5 times
	log.Println("start inventory...")
	antennaCount := 4 //4
	loopCount := 5    //5
	i := 0            // ant id
	for i < antennaCount {
		// set antenna
		if codes, err := WriteCmdSerial4(0x74, byte(i), ser); err != nil {
			log.Printf("set antenna[%d] error:", i)
			log.Println(err)
		} else {
			if codes[0] == 0x10 { // set ant success
				j := 0 // read loop
				for j < loopCount {
					// do inventory
					if resp, err := WriteCmdSerial4(0x80, 0x03, ser); err != nil {
						log.Println("do inventory got error:")
						log.Println(err)
					} else {
						sz := len(resp)
						if sz == 1 {
							log.Printf("antId: %d, got error: %s\n",
								i, FormatErrCode(resp[0]))
						} else if sz == 9 {
							antId := int(resp[0])
							tagCount := binary.BigEndian.Uint16(resp[1:3])
							if tagCount > 0 {
								log.Printf("antId: %d, tagCount:%d\n",
									antId, tagCount)
								haveTag = true
							}
						} else {
							log.Printf("get sz data: %d\n", sz)
						}
					}
					j++
					time.Sleep(time.Duration(sleep) * time.Second)
				}
			} else {
				log.Printf("set antenna error[code:%X]\n", codes[0])
			}
		}
		i++
	}
	log.Println("inventory done.")

	//get inventory buffer
	log.Println("getting inventory buffer...")
	tags := make([]proto.Tag, 0)
	if haveTag {
		cmdGetInventoryBuffer := byte(0x90)
		if resp, err := WriteCmdSerial3(cmdGetInventoryBuffer, ser); err != nil {
			fmt.Println(err)
			return readerId, nil, err
		} else {
			sz := len(resp)
			if sz == 1 {
				log.Printf("get inventory buffer error: %s\n",
					FormatErrCode(resp[0]))
			} else if sz > 2 {
				tagCount := binary.BigEndian.Uint16(resp[0:2])
				if sz >= 6 {
					tag := getTagInfo(resp, readerId)
					tags = append(tags, tag)
				}
				if tagCount > 1 {
					leftTagCount := tagCount - 1
					for leftTagCount > 0 {
						szbuf := make([]byte, 2)
						if _, err = io.ReadFull(ser, szbuf); err != nil {
							log.Println("read header error:")
							log.Println(err)
						} else {
							ilen := int(szbuf[1])
							databuf := make([]byte, ilen)
							if _, err = io.ReadFull(ser, databuf); err != nil {
								log.Println("read data error:")
								log.Println(err)
							} else {
								buf2 := databuf[2 : len(databuf)-1] // remove head and check byte
								sz2 := len(buf2)
								if sz2 >= 6 {
									tag := getTagInfo(buf2, readerId)
									tags = append(tags, tag)
								} else {
									log.Printf("get tag size error: size=%d\n", sz2)
								}
							}
						}
						leftTagCount--
					}
				}
			} else {
				log.Printf("get inventory buffer error: size=%d\n", sz)
			}
		}
		// reset inventory
		cmdResetInventoryBuffer := byte(0x93)
		if resp, err := WriteCmdSerial3(cmdResetInventoryBuffer, ser); err != nil {
			fmt.Println(err)
			return readerId, nil, err
		} else {
			sz := len(resp)
			if sz == 1 {
				if resp[0] != 0x10 {
					msg := FormatErrCode(resp[0])
					log.Printf("reset inventory buffer error: %s\n", msg)
				}
			} else {
				log.Printf("reset inventory buffer error: size=%d\n", sz)
			}
		}
	}
	log.Println("get inventory buffer done.")
	return readerId, tags, nil
}

func getTagInfo(buf []byte, readerId string) proto.Tag {
	sz := len(buf)
	tagSize := int(buf[2]) // tag size
	epcSize := tagSize - 4
	log.Printf("sz: %d, tagSize:%d, epcSize:%d\n",
		sz, tagSize, epcSize)
	rssi := toRSSI(buf[sz-3])
	freqAnt := buf[sz-2]
	freq := toFreq(freqAnt >> 2)
	ant := int(freqAnt<<6) + 1
	invCount := int(buf[sz-1])
	epc := strings.ToUpper(hex.EncodeToString(buf[5 : epcSize+5]))
	return proto.Tag{
		EPC:      epc,
		ReaderId: readerId,
		InvCount: invCount,
		Freq:     freq,
		RSSI:     rssi,
		Ant:      ant,
	}
}

func toRSSI(d byte) int {
	return -31 - int(98-d)
}

func toFreq(d byte) float32 {
	if d < 0x06 {
		return 868.0 - float32(0x06-d)*0.5
	} else if d < 0x2A {
		return 919.5 - float32(0x2A-d)*0.5
	} else if d < 0x3B {
		return 928.0 - float32(0x3B-d)*0.5
	}
	return float32(d)
}

func WriteCmdSerial3(cmd byte, rwc io.ReadWriteCloser) ([]byte, error) {
	data := []byte{0xA0, 0x03, 0x01, cmd}
	return WriteCmdSerial(cmd, data, rwc)
}
func WriteCmdSerial4(cmd byte, id byte, rwc io.ReadWriteCloser) ([]byte, error) {
	data := []byte{0xA0, 0x04, 0x01, cmd, id}
	return WriteCmdSerial(cmd, data, rwc)
}

func WriteCmdSerial(cmd byte, data []byte, rwc io.ReadWriteCloser) ([]byte, error) {
	buf, err := WriteSerial(data, rwc)
	if err == nil {
		if buf[1] != cmd {
			return nil, errors.New("return CMD error")
		}
		return buf[2 : len(buf)-1], nil
	}
	return nil, err
}

func WriteCmdOnly(cmd byte, rwc io.ReadWriteCloser) error {
	data := []byte{0xA0, 0x03, 0x01, cmd}
	return WriteSerialOnly(data, rwc)
}

func WriteSerialOnly(data []byte, rwc io.ReadWriteCloser) error {
	bdata := AppendCheckSum(data)
	if _, err := rwc.Write(bdata); err != nil {
		return err
	}
	return nil
}

func WriteSerial(data []byte, rwc io.ReadWriteCloser) ([]byte, error) {
	var (
		n   int
		err error
	)
	bdata := AppendCheckSum(data)
	if n, err = rwc.Write(bdata); err != nil {
		return nil, err
	}
	header := make([]byte, 1)
	if n, err = io.ReadFull(rwc, header); err != nil {
		return nil, err
	}
	if n == 0 {
		return nil, errors.New("read com timeout")
	}
	if header[0] != 0xA0 {
		return nil, errors.New(
			fmt.Sprintf("error return header code, %d", n))
	}
	szbuf := make([]byte, 1)
	if n, err = io.ReadFull(rwc, szbuf); err != nil {
		return nil, err
	}
	sz := int(szbuf[0])
	buf := make([]byte, sz)
	if n, err = io.ReadFull(rwc, buf); err != nil {
		return nil, err
	}
	return buf, nil
}

func AppendCheckSum(data []byte) []byte {
	sum := checkSum(data)
	return append(data, byte(sum))
}

func checkSum(data []byte) uint16 {
	var (
		sum    byte
		length int = len(data)
		idx    int
	)
	for idx < length {
		sum += data[idx]
		idx += 1
	}
	return uint16(((^sum) + 1) & 0xFF)
}
