package main

import (
	"./cdata"
	"bytes"
	"fmt"
	"github.com/go-pg/pg"
	"github.com/go-pg/pg/orm"
	"handler"
	"log"
	"math/rand"
	"model"
	"time"
)

func main() {
	db := pg.Connect(&pg.Options{
		Addr:     "172.16.23.246:5432",
		User:     "postgres",
		Password: "DL>COM",
		Database: "eam",
	})

	defer db.Close()

	if err := createSchema(db); err != nil {
		panic(err)
	}

	fmt.Println("create schema success.")
}

func deleteAllTable(db *pg.DB) error {
	sql := `
SELECT DISTINCT(table_name) 
from information_schema.columns 
where table_schema='public'
    `
	var names []string
	if _, err := db.Query(&names, sql); err != nil {
		return err
	}

	for _, name := range names {
		if _, err := db.Exec(fmt.Sprintf("drop table \"%s\"", name)); err != nil {
			return err
		}
	}

	return nil
}

func initTestUser(db *pg.DB) error {
	i := 0
	count := 0
	var tx *pg.Tx
	for i < 200 {
		if count == 0 {
			var err error
			if tx, err = db.Begin(); err != nil {
				return err
			}
		}
		name := fmt.Sprintf("user%d", i)
		pwd := handler.Md5WithHash("test123")
		user1 := &model.User{
			Account:    name,
			Password:   pwd,
			Role:       "user",
			Name:       name,
			Email:      name + "@admin.com",
			Phone:      "1232",
			Memo:       "Test",
			CreateTime: time.Now().UTC(),
		}
		if err := tx.Insert(user1); err != nil {
			return err
		}
		i++
		count++
		if count == 500 {
			if err := tx.Commit(); err != nil {
				return err
			}
			log.Printf("%d commit\n", count)
			count = 0
		}
	}
	if count > 0 {
		count = 0
		if err := tx.Commit(); err != nil {
			return err
		}
		log.Printf("%d commit\n", count)
	}
	return nil
}

func createSchema(db *pg.DB) error {
	if err := deleteAllTable(db); err != nil {
		panic(err)
	}
	for _, model := range []interface{}{
		(*model.AssetDept)(nil),
		(*model.AssetClass)(nil),
		(*model.Asset)(nil),
		(*model.AssetChange)(nil),
		(*model.AssetRepair)(nil),
		(*model.Device)(nil),
		(*model.DeviceFile)(nil),
		(*model.DeviceHeartBeat)(nil),
		(*model.Reader)(nil),
		(*model.Site)(nil),
		(*model.User)(nil),
		(*model.Tag)(nil),
		(*model.UserLog)(nil),
	} {
		if err := db.CreateTable(model,
			&orm.CreateTableOptions{}); err != nil {
			return err
		}
	}

	// default user
	pwd := handler.Md5WithHash("dingli")
	user := &model.User{
		Account:    "admin",
		Password:   pwd,
		Role:       "admin",
		Name:       "管理员",
		Email:      "admin@admin.com",
		Phone:      "123",
		Memo:       "Admin",
		CreateTime: time.Now().UTC(),
	}
	if err := db.Insert(user); err != nil {
		return err
	}
	var list []model.User
	if _, err := db.Query(&list, `
    SELECT * FROM "user" 
    ORDER BY create_time desc
    LIMIT 3 OFFSET 0 
    `); err != nil {
		return err
	}
	_ = cdata.InitAsset
	fmt.Printf("%v\n", list)

	/*
		if err := initTestUser(db); err != nil {
			return err
		}
	*/
	if err := cdata.InitAsset(db); err != nil {
		return err
	}
	/*
		if err := initChanges(db); err != nil {
			return err
		}
		if err := initRepair(db); err != nil {
			return err
		}*/

	return nil
}

func initRepair(db *pg.DB) error {
	var (
		buf   bytes.Buffer
		count int
		i     int
	)

	t := time.Now().UTC().AddDate(0, 0, -100)
	r := rand.New(rand.NewSource(
		time.Now().UnixNano()))
	sql := `COPY asset_repair(epc, create_time) FROM STDIN WITH CSV`
	for i < 2000 {
		t1 := int(r.Int31n(50))
		t2 := t.AddDate(0, 0, t1)
		buf.WriteString(fmt.Sprintf("repair_%d,%s\n",
			i, t2.Format("2006-01-02 15:04:05")))
		count++
		if count == 5000 {
			if _, err := db.CopyFrom(&buf, sql); err != nil {
				return err
			}
			log.Printf("repair: %d commit\n", count)
			buf.Reset()
			count = 0
		}
		i++
	}
	if count > 0 {
		if _, err := db.CopyFrom(&buf, sql); err != nil {
			return err
		}
		log.Printf("repair: %d commit\n", count)
		count = 0
	}
	fakeY := []int{
		5, 6, 5, 9, 6, 3, 1, 5, 3, 6,
		5, 7, 5, 4, 2, 4, 7, 3, 5, 7,
		10, 5, 4, 3, 8, 7, 3, 9, 7, 2,
	}
	buf.Reset()
	t5 := time.Now().UTC().AddDate(0, 0, -30)
	for idx, fake := range fakeY {
		i = 0
		for i < fake {
			t55 := t5.AddDate(0, 0, idx)
			buf.WriteString(fmt.Sprintf("repair_%d_%d,%s\n",
				idx, i, t55.Format("2006-01-02 15:04:05")))
			i++
		}
	}
	if _, err := db.CopyFrom(&buf, sql); err != nil {
		return err
	}
	return nil
}

func initChanges(db *pg.DB) error {
	var (
		buf   bytes.Buffer
		count int
		i     int
	)
	t := time.Now().UTC().AddDate(0, 0, -50)
	r := rand.New(rand.NewSource(
		time.Now().UnixNano()))
	changeSql := `COPY asset_change(epc, last_reader_id, 
    current_reader_id, is_pass,create_time) FROM STDIN WITH CSV`
	for i < 5000 {
		t1 := int(r.Int31n(50))
		t2 := t.AddDate(0, 0, t1)
		buf.WriteString(fmt.Sprintf("Change_%d, FF002, FF001,0,%s\n",
			i, t2.Format("2006-01-02 15:04:05")))
		count++
		if count == 10000 {
			if _, err := db.CopyFrom(&buf, changeSql); err != nil {
				return err
			}
			log.Printf("change: %d commit\n", count)
			buf.Reset()
			count = 0
		}
		i++
	}
	if count > 0 {
		if _, err := db.CopyFrom(&buf, changeSql); err != nil {
			return err
		}
		log.Printf("change: %d commit\n", count)
		count = 0
	}
	return nil

	t4 := time.Now().UTC().AddDate(-2, 0, 0)
	i = 0
	count = 0
	for i < 100000 {
		t1 := int(r.Int31n(365 * 2))
		t2 := t4.AddDate(0, 0, t1)
		buf.WriteString(fmt.Sprintf("Change_%d,FF003,FF005,0,%s\n",
			i, t2.Format("2006-01-02 15:04:05")))
		count++
		if count == 10000 {
			if _, err := db.CopyFrom(&buf, changeSql); err != nil {
				return err
			}
			log.Printf("change: %d commit\n", count)
			buf.Reset()
			count = 0
		}
		i++
	}
	if count > 0 {
		if _, err := db.CopyFrom(&buf, changeSql); err != nil {
			return err
		}
		log.Printf("change: %d commit\n", count)
		count = 0
	}
	return nil
}
