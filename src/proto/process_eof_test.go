package proto

import (
	"fmt"
	"github.com/go-pg/pg"
	"io/ioutil"
	"testing"
)

func Test_Main(t *testing.T) {
	db := pg.Connect(&pg.Options{
		Addr:     "172.16.23.246:5432",
		User:     "postgres",
		Password: "DL>COM",
		Database: "eam",
	})

	defer db.Close()

	data, _ := ioutil.ReadFile(
		"2018-05-28_17_22_47.json")
	runData(data, db)
	fmt.Println(data)
}
