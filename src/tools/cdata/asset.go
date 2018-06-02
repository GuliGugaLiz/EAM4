package cdata

import (
	"bytes"
	"fmt"
	"github.com/go-pg/pg"
	"log"
	"math/rand"
	"model"
	"time"
)

var classNames = []string{"低值易耗品", "电池", "板卡", "天线", "其他"}

func InitAssetClass(db *pg.DB) error {
	for _, name := range classNames {
		cla := model.AssetClass{
			Name:       name,
			CreateTime: time.Now().UTC(),
		}
		if err := db.Insert(&cla); err != nil {
			return err
		}
	}
	return nil
}

var deptNames = []string{
	"网络优化中心", "集团监控室",
	"运维1部", "运维生产车间", "运维2部",
	"运维3部", "运维4部", "运维5部",
	"网建1部", "网建2部", "网建3部", "网建4部",
}

func InitAssetDept(db *pg.DB) error {
	for _, name := range deptNames {
		item := model.AssetDept{
			Name:       name,
			CreateTime: time.Now().UTC(),
		}
		if err := db.Insert(&item); err != nil {
			return err
		}
	}
	return nil
}

func InitAsset(db *pg.DB) error {
	if err := InitAssetClass(db); err != nil {
		return err
	}
	if err := InitAssetDept(db); err != nil {
		return err
	}
	return nil

	r := rand.New(rand.NewSource(
		time.Now().UnixNano()))
	var (
		buf   bytes.Buffer
		count int
		i     int
	)
	copySql := `COPY asset(name, class_id, dept_id, use_state_id, create_time) 
    FROM STDIN WITH CSV`
	for i < 20000 {
		classId := int(r.Int31n(5)) + 1
		deptId := int(r.Int31n(12)) + 1
		stateId := 1
		buf.WriteString(fmt.Sprintf("Asset%d,%d,%d,%d,%s\n",
			i, classId, deptId, stateId,
			time.Now().UTC().Format("2006-01-02 15:04:05")))
		count++
		if count == 5000 {
			if _, err := db.CopyFrom(&buf, copySql); err != nil {
				return err
			}
			log.Printf("asset: %d commit\n", count)
			buf.Reset()
			count = 0
		}
		i++
	}
	if count > 0 {
		if _, err := db.CopyFrom(&buf, copySql); err != nil {
			return err
		}
		log.Printf("asset: %d commit\n", count)
		buf.Reset()
		count = 0
	}

	t5 := time.Now().UTC().AddDate(-1, 0, 0)
	i = 0
	count = 3000
	for i < count {
		classId := int(r.Int31n(2)) + 1
		deptId := int(r.Int31n(2)) + 1
		stateId := 2
		buf.WriteString(fmt.Sprintf("Asset%d,%d,%d,%d,%s\n",
			i, classId, deptId, stateId,
			t5.Format("2006-01-02 15:04:05")))
		i++
	}
	if _, err := db.CopyFrom(&buf, copySql); err != nil {
		return err
	}
	buf.Reset()
	log.Printf("asset: %d commit\n", count)

	t6 := time.Now().UTC().AddDate(0, -1, 0)
	i = 0
	count = 30000
	for i < count {
		classId := int(r.Int31n(4)) + 1
		deptId := int(r.Int31n(4)) + 1
		stateId := 0
		buf.WriteString(fmt.Sprintf("Asset%d,%d,%d,%d,%s\n",
			i, classId, deptId, stateId,
			t6.Format("2006-01-02 15:04:05")))
		i++
	}
	if _, err := db.CopyFrom(&buf, copySql); err != nil {
		return err
	}
	buf.Reset()
	log.Printf("asset: %d commit\n", count)

	return nil
}
