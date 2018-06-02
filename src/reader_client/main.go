package main

import (
	"encoding/json"
	"flag"
	"fmt"
	"io/ioutil"
	"log"
	"os"
	"path/filepath"
	"proto"
	"reader"
	"reader_client/web"
	"service"
	"time"
	"utils"
)

const DataPath = "/data/"
const LogDataPath = DataPath + "log/"

func init() {
	log.SetPrefix("EAM:")
	log.SetFlags(log.Lmicroseconds | log.Lshortfile)
}

var install = flag.Bool("install", false, "install services")
var remove = flag.Bool("remove", false, "remove services")
var svc = flag.Bool("svc", false, "run on services")
var start = flag.Bool("start", false, "start services")
var stop = flag.Bool("stop", false, "stop services")

var name = "EAM_client"
var displayName = "EAM_client"
var desc = "EAM client for tag reader"

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

var exit = make(chan struct{})

func stopWork() {
	log.Println("Work Stopping!")
	exit <- struct{}{}
}

func doWork() {
	createDataPath()
	setting := getSetting()
	web.UpdateCommonStatus(setting)

	// start web
	go web.StartWeb(setting.WebHost)
	lastUpload := setting.LastUpload
	var lastHeartBeat *time.Time
	//check time to do job
	ticker := time.NewTicker(1 * time.Second)
	readerIds := make([]string, 0)
	for {
		select {
		case <-ticker.C:
			can := true
			uploadPreMinute := setting.UploadPreMinute
			heartBeatPreMinute := setting.HeartBeatPreMinute
			if lastUpload != nil {
				can = false
				diff := time.Now().Sub(*lastUpload)
				uploadDiff := time.Duration(uploadPreMinute) * time.Minute
				if diff > uploadDiff {
					can = true
				}
				log.Printf("upload diff: %s->%s, %t\n", diff, uploadDiff, can)
			}

			if can {
				var (
					err      error
					msg      string
					send     bool
					readerId string
				)
				if send, readerId, msg, err = doJob(setting); err != nil {
					msg = err.Error()
					log.Println("dojob got error:", err)
				} else {
					now := time.Now()
					lastUpload = &now
					have := false
					for _, rid := range readerIds {
						if rid == readerId {
							have = true
						}
					}
					if !have {
						readerIds = append(readerIds, readerId)
					}
				}
				web.SaveSetting(setting)
				if !send {
					msg = msg + "<br>Not Send."
				}
				web.UpdateUploadStatus(lastUpload, msg, send)
				web.UpdateCommonStatus(setting)
			}

			doHeartBeat := true
			if lastHeartBeat != nil {
				doHeartBeat = false
				diff := time.Now().Sub(*lastHeartBeat)
				newDiff := time.Duration(heartBeatPreMinute) * time.Minute
				if diff > newDiff {
					doHeartBeat = true
				}
				log.Printf("heartbeat diff: %s->%s, %t\n", diff,
					newDiff, doHeartBeat)
			}

			if doHeartBeat {
				if devId, err := reader.GetRCUId(); err != nil {
					log.Println(err)
				} else {
					var (
						msg string
						ok  bool
					)
					log.Printf("got rcuid[%s]\n", devId)
					if err := reader.SendHeartBeat(setting.Host,
						setting.Port, devId, readerIds); err != nil {
						msg = fmt.Sprintf("heartbeat got error: %s", err)
						log.Println(msg)
						ok = false
					} else {
						msg = "heartbeat ok."
						log.Println(msg)
						ok = true
					}
					t := time.Now()
					lastHeartBeat = &t
					web.UpdateHeartBeatStatus(lastHeartBeat, msg, ok)
				}
			}
		case <-exit:
			ticker.Stop()
			return
		}
	}
	web.SaveSetting(setting)
	//TODO: more setting on json file
}

func createDataPath() {
	//create data and log dir
	spath := filepath.Join(utils.APP_DIR, LogDataPath)
	if ok, err, _ := utils.PathExists(spath); !ok {
		if err = os.MkdirAll(spath, os.ModePerm); err != nil {
			log.Fatal(err)
		}
	}
}

func getSetting() *reader.Setting {
	var setting *reader.Setting
	settingPath := filepath.Join(utils.APP_DIR, DataPath, "setting.json")
	if txt, err := ioutil.ReadFile(settingPath); err != nil {
		setting = reader.GetDefaultSetting()
		if txt2, err := json.MarshalIndent(setting, "", "  "); err != nil {
			log.Fatal(err)
			return nil
		} else {
			if err = ioutil.WriteFile(settingPath, txt2, os.ModePerm); err != nil {
				log.Fatal(err)
				return nil
			}
		}
	} else {
		if err = json.Unmarshal(txt, &setting); err != nil {
			log.Fatal(err)
			return nil
		}
	}

	if setting.UploadPreMinute < 3 {
		setting.UploadPreMinute = 3
	}
	return setting
}

func doJob(setting *reader.Setting) (bool, string, string, error) {
	var (
		devId         string
		sendAll       bool
		uploadJson    []byte
		uploadAllJson []byte
		tags          []proto.Tag
		olds          []proto.Tag
		err           error
		send          bool
		readerId      string
	)

	now := time.Now()
	//utcNow := now.UTC()
	log.Printf("job start: %s\n", now.Format("2006-01-02 15:04:05"))
	defer func() {
		log.Printf("job done: %s\n", time.Now().Format("2006-01-02 15:04:05"))
	}()

	//get rcu id
	if devId, err = reader.GetRCUId(); err != nil {
		log.Println(err)
		return false, "", "", err
	}
	log.Printf("got rcuid[%s]\n", devId)
	//get inventory item list
	if readerId, tags, err = reader.GetEPCList(1); err != nil {
		log.Println(err)
		return false, "", "", err
	}
	tagsCount := len(tags)
	log.Printf("inventory count:%d\n", tagsCount)
	dictTags := make(map[string]proto.Tag)
	for i := 0; i < tagsCount; i++ {
		tag := &tags[i]
		tag.LastCheck = &now
		tag.FirstFound = &now
		dictTags[tag.EPC] = *tag
	}

	dataFile := filepath.Join(utils.APP_DIR, DataPath, "data.json")
	if txt, err := ioutil.ReadFile(dataFile); err != nil {
		log.Println(err)
	} else {
		if err = json.Unmarshal(txt, &olds); err != nil {
			log.Println(err)
		}
	}
	changes := make([]proto.Tag, 0)
	losts := make([]proto.Tag, 0)
	adds := make([]proto.Tag, 0)
	oldEPCs := make(map[string]bool)

	if len(olds) > 0 {
		//compare to olds
		for _, tagOld := range olds {
			epc := tagOld.EPC
			oldEPCs[epc] = true
			if tagNew, ok := dictTags[epc]; ok {
				if tagOld.Ant != tagNew.Ant {
					changes = append(changes, tagOld)
				} else {
					tagNew.FirstFound = tagOld.FirstFound
				}
			} else { //lost
				tagOld.Lost = &now
				losts = append(losts, tagOld)
			}
		}
	}
	for epc, tag := range dictTags {
		if _, ok := oldEPCs[epc]; !ok {
			adds = append(adds, tag)
		}
	}
	//set file to remote
	upload := &proto.Upload{
		DevId:     devId,
		Add:       adds,
		Lost:      losts,
		Change:    changes,
		CheckTime: &now,
	}

	uploadAll := &proto.Upload{
		DevId:     devId,
		Current:   tags,
		CheckTime: &now,
	}

	haveUpdate := false //have some to update
	if len(adds) > 0 || len(losts) > 0 || len(changes) > 0 {
		haveUpdate = true
	}

	msg := fmt.Sprintf("[olds:%d, adds:%d, losts:%d, current:%d, changes:%d]",
		len(olds), len(adds), len(losts), len(tags), len(changes))
	log.Println(msg)
	log.Printf("[haveUpdate:%t]\n", haveUpdate)

	if uploadJson, err = json.Marshal(upload); err != nil {
		log.Println(err)
		return false, readerId, "", err
	}

	if uploadAllJson, err = json.Marshal(uploadAll); err != nil {
		log.Println(err)
		return false, readerId, "", err
	}

	now1 := time.Now().Format("2006-01-02_15_04_05")
	logName := fmt.Sprintf("%s.json", now1)
	logFile := filepath.Join(utils.APP_DIR, LogDataPath, logName)
	logNotSend := filepath.Join(utils.APP_DIR, LogDataPath, fmt.Sprintf("%s_notsend.json", now1))

	loop := true
	loopCount := 5
	idx := 1
	log.Printf("file:%s\nuploadJson sz:%d, uploadAllJson sz:%d\n",
		logFile, len(uploadJson), len(uploadAllJson))
	for loop {
		log.Printf("sending to remote[%s:%d] try[%d]...\n",
			setting.Host, setting.Port, idx)
		if sendAll, err = reader.SendToRemote(setting.Host, setting.Port,
			tagsCount,
			devId, []string{readerId}, haveUpdate, logName,
			uploadJson, uploadAllJson); err != nil {
			log.Printf("send to remote got error:\n%s\n", err)
			loop = true
			loopCount = loopCount - 1
			if loopCount <= 0 {
				loop = false
			}
			idx++
		} else { // send ok
			log.Printf("send to remote[%s:%d] try[%d] done.\n",
				setting.Host, setting.Port, idx)
			send = true
			loop = false
			break
		}
		time.Sleep(2 * time.Second)
	}

	if send {
		//sae to local when success
		//save tags
		if txt, err := json.Marshal(tags); err != nil {
			log.Println(err)
		} else {
			if err = ioutil.WriteFile(dataFile, txt, os.ModePerm); err != nil {
				log.Println(err)
			} else {
				log.Printf("save data: %s", dataFile)
			}
		}
	}

	//save upload log
	if !send {
		logFile = logNotSend
		upload.Current = tags
		if uploadJson, err = json.Marshal(upload); err != nil {
			log.Println(err)
		}
		log.Printf("not send remote: %s\n", logName)
	} else {
		now2 := time.Now()
		setting.LastUpload = &now2
		log.Printf("send remote done: %s\n", logName)
		if sendAll { // actual send this json
			uploadJson = uploadAllJson
		}
	}
	if err = ioutil.WriteFile(logFile, uploadJson, os.ModePerm); err != nil {
		log.Println(err)
	}

	return send, readerId, msg, nil
}
