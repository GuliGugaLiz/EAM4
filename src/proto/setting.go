package proto

import (
	"encoding/json"
	"io/ioutil"
	"log"
	"os"
	"path/filepath"
	"utils"
)

type DBSetting struct {
	Host     string
	Port     int
	User     string
	Password string
	Database string
}

type Setting struct {
	ListenPort int
	WebPort    int
	DB         DBSetting
}

func getDefaultSetting() *Setting {
	return &Setting{
		ListenPort: 9990,
		WebPort:    9980,
		DB: DBSetting{

			Host:     "172.16.23.246",
			Port:     5432,
			User:     "postgres",
			Password: "DL>COM",
			Database: "eam",
		},
	}
}

func GetSetting() *Setting {
	var setting *Setting
	spath := filepath.Join(utils.APP_DIR, "setting.json")
	if txt, err := ioutil.ReadFile(spath); err != nil {
		setting = getDefaultSetting()
		if txt2, err := json.MarshalIndent(setting, "", "  "); err != nil {
			log.Fatal(err)
			return nil
		} else {
			if err = ioutil.WriteFile(spath, txt2, os.ModePerm); err != nil {
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

	return setting
}
