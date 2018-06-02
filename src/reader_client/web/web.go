package web

import (
	"encoding/json"
	"fmt"
	"html/template"
	"io/ioutil"
	"log"
	"net/http"
	"os"
	"path/filepath"
	"reader"
	"runtime"
	"strconv"
	"sync"
	"time"
)

const indexTPL = `
<html>
		<head>
        <title>EAM reader client</title>
		</head>
		<body>
        <hr />
			<form action="/" method="POST">
<table>
<tr>
    <td>Host:</td>
    <td><input name="Host" value="{{.Host}}" /></td>
</tr>

<tr>
    <td>Port:</td>
    <td><input name="Port" value="{{.Port}}" /></td>
</tr>

<tr>
    <td>HeartBeatPreMinute:</td>
    <td><input name="HeartBeatPreMinute" value="{{.HeartBeatPreMinute}}" /></td>
</tr>

<tr>
    <td>UploadPreMinute:</td>
    <td><input name="UploadPreMinute" value="{{.UploadPreMinute}}" /></td>
</tr>

<tr>
    <td>Status:</td>
    <td>
    <div style="color:{{.HeartBeatColor}}">
        LastHeatBeatTime:{{.LastHeartBeat | fdate}}, 
        <br />Message: {{.HeartBeatResponse}} 
    </div>
    <div style="margin:18px 0 0 0;color:{{.UploadColor}}">
        LastUploadTime:{{.LastUpload | fdate}}, 
        <br />Message: {{.UploadResponse}}
    </div>
    </td>
</tr>


<table>

        <hr />
        <input type="submit" value="Save"/>
			</form>
		</body>
</html>
`
const DataPath = "./data/"

type webStatus struct {
	Host               string
	Port               int
	HeartBeatPreMinute int
	UploadPreMinute    int
	UploadColor        string
	LastHeartBeat      *time.Time
	LastUpload         *time.Time
	HeartBeatResponse  string
	HeartBeatColor     string
	UploadResponse     string
}

var status webStatus
var rw sync.Mutex
var setting *reader.Setting

func UpdateCommonStatus(s *reader.Setting) {
	if setting == nil {
		setting = s
	}
	rw.Lock()
	defer rw.Unlock()
	status.Host = s.Host
	status.Port = s.Port
	status.HeartBeatPreMinute = s.HeartBeatPreMinute
	status.UploadPreMinute = s.UploadPreMinute
}

func UpdateStatus(host string, port int, heartBeat int, upload int) {
	rw.Lock()
	defer rw.Unlock()
	if setting != nil {
		setting.Host = host
		setting.Port = port
		setting.HeartBeatPreMinute = heartBeat
		setting.UploadPreMinute = upload
	}
	status.Host = host
	status.Port = port
	status.HeartBeatPreMinute = heartBeat
	status.UploadPreMinute = upload
}

func getStatus() webStatus {
	rw.Lock()
	defer rw.Unlock()
	return status
}

func UpdateUploadStatus(t *time.Time, resp string, ok bool) {
	rw.Lock()
	defer rw.Unlock()
	status.LastUpload = t
	status.UploadResponse = resp
	if ok {
		status.UploadColor = "green"
	} else {
		status.UploadColor = "red"
	}
}

func UpdateHeartBeatStatus(t *time.Time, resp string, ok bool) {
	rw.Lock()
	defer rw.Unlock()
	status.LastHeartBeat = t
	status.HeartBeatResponse = resp
	if ok {
		status.HeartBeatColor = "green"
	} else {
		status.HeartBeatColor = "red"
	}
}

func formDate(t *time.Time) string {
	if t == nil {
		return ""
	}
	return t.Format("2006-01-02 15:04:05")
}

func getValues(r *http.Request) (string, int, int, int, bool) {
	ok := false
	var (
		host      string
		port      int
		heartBeat int
		upload    int
	)
	hosts := r.Form["Host"]
	sport := r.Form["Port"]
	sheartBeat := r.Form["HeartBeatPreMinute"]
	supload := r.Form["UploadPreMinute"]
	if hosts != nil && len(hosts) > 0 {
		host = hosts[0]
		if sport != nil && len(sport) > 0 {
			if iport, err := strconv.ParseUint(sport[0], 10, 16); err == nil {
				port = int(iport)
				ok = true
			}
		}
	}
	if ok && sheartBeat != nil && len(sheartBeat) > 0 {
		if iheartBeat, err := strconv.ParseUint(
			sheartBeat[0], 10, 16); err == nil {
			heartBeat = int(iheartBeat)
			ok = true
		}
	} else {
		ok = false
	}
	if ok && supload != nil && len(supload) > 0 {
		if iupload, err := strconv.ParseUint(
			supload[0], 10, 16); err == nil {
			upload = int(iupload)
			ok = true
		}
	} else {
		ok = false
	}

	return host, port, heartBeat, upload, ok
}

func index(w http.ResponseWriter, r *http.Request) {
	r.ParseForm()
	var (
		t   *template.Template
		err error
	)
	if host, port, heartBeat, upload, ok := getValues(r); ok {
		log.Println("Upload config.")
		UpdateStatus(host, port, heartBeat, upload)
	}

	funcMap := template.FuncMap{"fdate": formDate}
	t = template.New("index").Funcs(funcMap)
	if t, err = t.Parse(indexTPL); err != nil {
		fmt.Fprintf(w, "error:"+err.Error())
		return
	} else {
		s := getStatus()
		if err = t.Execute(w, s); err != nil {
			fmt.Fprintf(w, "error:"+err.Error())
			return
		}
	}
}

func StartWeb(host string) {
	http.HandleFunc("/", index)
	url := ":9991"
	if runtime.GOOS == "linux" { // when in rcu
		//url = "219.198.245.12:9991"
		url = fmt.Sprintf("%s:9991", host)
	}
	log.Printf("Web Listen on %s\n", url)
	if err := http.ListenAndServe(url, nil); err != nil {
		log.Println("Web Listen error: ", err)
	}
}

func SaveSetting(setting *reader.Setting) {
	settingPath := filepath.Join(DataPath, "setting.json")
	if setting.UploadPreMinute < 3 {
		setting.UploadPreMinute = 3
	}
	//setting.LastUnFinishFile = logFile
	//save setting
	if txt, err := json.MarshalIndent(setting, "", "  "); err != nil {
		log.Println(err)
	} else {
		if err = ioutil.WriteFile(settingPath, txt, os.ModePerm); err != nil {
			log.Println(err)
		} else {
			log.Printf("update setting done: %s\n", settingPath)
		}
	}
}
