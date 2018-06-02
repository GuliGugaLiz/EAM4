package main

import (
	"encoding/binary"
	"flag"
	"fmt"
	"github.com/go-pg/pg"
	"io"
	"log"
	"net"
	"proto"
	"service"
	"strings"
	"utils"
)

func init() {
	log.SetPrefix("EAM:")
	log.SetFlags(log.Lmicroseconds | log.Lshortfile)
}

var install = flag.Bool("install", false, "install services")
var remove = flag.Bool("remove", false, "remove services")
var svc = flag.Bool("svc", false, "run on services")
var start = flag.Bool("start", false, "start services")
var stop = flag.Bool("stop", false, "stop services")

var name = "EAM_engine"
var displayName = "EAM_engine"
var desc = "EAM engine for data receive"

func main() {
	flag.Parse()
	var (
		s   service.Service
		err error
	)
	if s, err = service.NewService(name, displayName, desc); err != nil {
		fmt.Printf("%s unable to start: %s\n", displayName, err)
		return
	}

	if *install {
		if err = s.Install(); err != nil {
			fmt.Printf("Failed to install: %s\n", err)
			return
		}
		fmt.Printf("Service \"%s\" installed.\n", displayName)
		return
	}

	if *remove {
		if err = s.Remove(); err != nil {
			fmt.Printf("Failed to remove: %s\n", err)
			return
		}
		fmt.Printf("Service \"%s\" removed.\n", displayName)
		return
	}
	if *start {
		if err = s.Start(); err != nil {
			fmt.Printf("Failed to start: %s\n", err)
			return
		}
		fmt.Printf("Service \"%s\" started.\n", displayName)
		return
	}
	if *stop {
		if err = s.Stop(); err != nil {
			fmt.Printf("Failed to stop: %s\n", err)
			return
		}
		fmt.Printf("Service \"%s\" stopped.\n", displayName)
		return
	}
	if *svc {
		if err = s.Run(func() error {
			go doWork() // start
			return nil
		}, func() error {
			stopWork() //stop
			return nil
		}); err != nil {
			s.Error(err.Error())
		}
		return
	} else {
		doWork() // not in service
	}
}

var db *pg.DB
var lis net.Listener

func stopWork() {
	lis.Close()
}

func doWork() {
	setting := proto.GetSetting()

	dbsetting := setting.DB
	dbAddr := fmt.Sprintf("%s:%d", dbsetting.Host, dbsetting.Port)

	db = pg.Connect(&pg.Options{
		Addr:     dbAddr,
		User:     dbsetting.User,
		Password: dbsetting.Password,
		Database: dbsetting.Database,
	})

	if _, err := db.Exec("select 1;"); err != nil {
		log.Fatal(err)
	}
	defer db.Close()

	addr := fmt.Sprintf("%s:%d", "", setting.ListenPort)
	var err error
	lis, err = net.Listen("tcp", addr)
	if err != nil {
		log.Fatal(err.Error())
	}
	defer lis.Close()

	log.Printf("server[%s] waiting for clients.\n", addr)
	for {
		conn, err := lis.Accept()
		if err != nil {
			continue
		}
		log.Println(conn.RemoteAddr().String(), " connected.")
		go handle(conn)
	}
}

func handle(conn net.Conn) {
	for {
		remote := conn.RemoteAddr()
		remoteAddr := remote.String()
		buf := make([]byte, 2)
		n, err := io.ReadFull(conn, buf)
		if err != nil {
			if err == io.EOF {
				log.Println(remoteAddr, "eof: ", err)
				break
			}
			log.Println(remoteAddr, "got 1 error: ", err)
			break
		}
		sz := binary.BigEndian.Uint16(buf[:n]) // max 65536
		dataBuf := make([]byte, sz)
		n, err = io.ReadFull(conn, dataBuf)
		if err != nil {
			if err == io.EOF {
				log.Println(remoteAddr, "eof: ", err)
				break
			}
			log.Println(remoteAddr, "got error: ", err)
			continue
		}
		data := dataBuf[:n]
		dp := proto.New(data)
		command := strings.ToLower(dp.Command)
		response := dp.GetErrResponse("Command Invalid", nil)
		ok := false
		if command == "fileupload" {
			ok, response = proto.UploadRequest(dp, db)
		} else if command == "heartbeat" {
			ok, response = proto.HeartBeat(remote, dp, db)
		} else if command == "filedata" {
			ok, response = dp.CheckFileSession("5")
			if ok {
				ok, response = proto.DataRequest(dp)
			}
		} else if command == "fileeof" {
			ok, response = dp.CheckFileSession("1")
			if ok {
				ok, response = proto.EofRequest(remote, dp, db)
			}
		} else {
			log.Println(remoteAddr, "get error command: ", dp.Command)
		}
		log.Printf("%s: command: %s, ok: %t, sz:%d. %s\n",
			remoteAddr, dp.Command, ok, len(response), response)
		if response != "" {
			n, err = utils.ConnWrite(conn, response)
			if err != nil {
				if err == io.EOF {
					log.Println(remoteAddr, "eof: ", err)
					break
				}
				log.Println(remoteAddr, "write error: ", err)
				break
			}
		}
	}
}
