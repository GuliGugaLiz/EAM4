package handler

import (
	"github.com/gin-gonic/gin"
	"log"
	"time"
)

func InitDashboard(e *gin.Engine, r *gin.RouterGroup) {
	r.GET("/dashboard/main", dashboardMain)
}

type UseDept struct {
	Idx   int
	Name  string
	Count int64
	Range int16
}

type DataXY struct {
	X string `json:"x"`
	Y int64  `json:"y"`
}

type SummaryAsset struct {
	Total            int64
	MonthVsLastYear  float64
	MonthVsLastMonth float64
	MonthAvg         float64
}
type itemDB struct {
	Val  int64
	Name string
}

type SummaryChange struct {
	Total    int64
	MonthAvg float64
	DayAvg   float64
}

type SummaryRepair struct {
	Total            int64
	MonthVsLastYear  float64
	MonthVsLastMonth float64
}

func dashboardMain(c *gin.Context) {
	var (
		changeData       []DataXY
		repairData       []DataXY
		useDeptData      []UseDept
		assetData        []DataXY
		assetDataOnline  []DataXY
		assetDataOffline []DataXY
		assetDataRepair  []DataXY
		summaryAsset     *SummaryAsset
		summaryChange    *SummaryChange
		summaryRepair    *SummaryRepair
	)

	changeData = getChangeData()
	repairData = getRepairData()

	//use dept range
	useDeptData = getUseDept()

	//asset data
	assetData, assetDataOnline, assetDataOffline, assetDataRepair =
		getAssetData()

	summaryAsset, _ = getSummary1()
	summaryChange, _ = getSummary2()
	summaryRepair, _ = getSummary3()

	c.JSON(200, gin.H{
		"changeData":       changeData,
		"repairData":       repairData,
		"useDeptData":      useDeptData,
		"assetData":        assetData,
		"assetDataOffline": assetDataOffline,
		"assetDataOnline":  assetDataOnline,
		"assetDataRepair":  assetDataRepair,
		"summaryAsset":     summaryAsset,
		"summaryChange":    summaryChange,
		"summaryRepair":    summaryRepair,
	})
}

const useDeptSql = `
select count(a.id) as val, 
    ad.name  as name
from asset a
inner join asset_dept ad
  on a.dept_id = ad.id
group by ad.name
order by count(a.id) desc 
`

func getUseDept() []UseDept {
	var items []itemDB
	if _, err := db.Query(&items, useDeptSql); err != nil {
		log.Println(err)
	}
	total := int64(0)
	for _, it := range items {
		total = total + it.Val
	}
	idx := 0
	count := len(items)
	datas := make([]UseDept, 0, count)
	for idx < count {
		it := items[idx]
		rang := int16(0)
		if total > 0 {
			rang = int16(float64(it.Val) / float64(total) * 100.0)
		}
		item := UseDept{
			Idx:   idx + 1,
			Name:  it.Name,
			Count: it.Val,
			Range: rang,
		}
		datas = append(datas, item)
		idx++
	}
	//log.Printf("%v\n", datas)
	return datas
}

type itemStateDB struct {
	Val   int64
	Name  string
	State int16
}

const assetDataSql = `
select count(a.id) as Val, ac.Name  as Name, a.use_state_id as State
from asset a
inner join asset_class ac
  on a.class_id = ac.id
group by ac.Name, a.use_state_id
order by count(a.id) desc 
`

func insertState(dict map[string]int64,
	it itemStateDB, name string, sid int16) {
	if it.State == sid {
		if _, ok := dict[name]; !ok {
			dict[name] = 0
		}
		dict[name] += it.Val
	}
}

func getAssetData() ([]DataXY, []DataXY,
	[]DataXY, []DataXY) {
	var items []itemStateDB
	if _, err := db.Query(&items, assetDataSql); err != nil {
		log.Println(err)
	}
	all := make(map[string]int64)
	state0 := make(map[string]int64)
	state1 := make(map[string]int64)
	state2 := make(map[string]int64)
	for _, it := range items {
		name := it.Name
		if _, ok := all[name]; !ok {
			all[name] = 0
		}
		all[name] += it.Val
		insertState(state0, it, name, 0)
		insertState(state1, it, name, 1)
		insertState(state2, it, name, 2)
	}
	all2 := createDataXY(all)
	state02 := createDataXY(state0)
	state12 := createDataXY(state1)
	state22 := createDataXY(state2)
	return all2, state02, state12, state22
}

func createDataXY(dict map[string]int64) []DataXY {
	list := make([]DataXY, 0, len(dict))
	for k, v := range dict {
		d := DataXY{
			X: k,
			Y: v,
		}
		list = append(list, d)
	}
	return list
}

const repairSql = `
select count(id) as val,  
    to_char(date_trunc('day',create_time),'yyyy-mm-dd') as name
from asset_repair
where create_time >=  date_trunc('day',now()) - interval '1 months'
group by date_trunc('day',create_time)
order by date_trunc('day',create_time) asc
`

func getRepairData() []DataXY {
	var items []itemDB
	if _, err := db.Query(&items, repairSql); err != nil {
		log.Println(err)
	}
	d := make(map[string]int64)
	for _, it := range items {
		d[it.Name] = it.Val
	}
	datas := make([]DataXY, 0, 33)
	y, m, day := time.Now().Date()
	end := time.Date(y, m, day, 0, 0, 0, 0, time.UTC)
	start := end.AddDate(0, -1, 0)
	for end.Sub(start) > time.Hour {
		start = start.AddDate(0, 0, 1)
		v := int64(0)
		k := start.Format("2006-01-02")
		if dv, ok := d[k]; ok {
			v = dv
		}
		item := DataXY{
			X: k,
			Y: v,
		}
		datas = append(datas, item)
	}
	return datas
}

const changeSql = `
select count(id) as val,  
    to_char(date_trunc('day',create_time),'yyyy-mm-dd') as name
from asset_change
where create_time >=  date_trunc('day',now()) - interval '1 months'
group by date_trunc('day',create_time)
order by date_trunc('day',create_time) asc
`

func getChangeData() []DataXY {
	var items []itemDB
	if _, err := db.Query(&items, changeSql); err != nil {
		log.Println(err)
	}
	d := make(map[string]int64)
	for _, it := range items {
		d[it.Name] = it.Val
	}
	datas := make([]DataXY, 0, 33)
	y, m, day := time.Now().Date()
	end := time.Date(y, m, day, 0, 0, 0, 0, time.UTC)
	start := end.AddDate(0, -1, 0)
	for end.Sub(start) > time.Hour {
		start = start.AddDate(0, 0, 1)
		v := int64(0)
		k := start.Format("2006-01-02")
		if dv, ok := d[k]; ok {
			v = dv
		}
		item := DataXY{
			X: k,
			Y: v,
		}
		datas = append(datas, item)
	}
	return datas
}

const sqlSummary1 = `
select count(distinct date_trunc('month',create_time)) as Val, 'MonthTotal'as Name 
from asset

Union all

  select count(id) as val, 'Total' as Name
  from asset

union ALL
select count(id) as val, 'CountThisMonth' as Name
from asset
where create_time >=  date_trunc('month', now() at time zone 'utc')

 Union all 
  
select count(id) as val, 'CountLastMonth' as Name 
from asset
where create_time >=  date_trunc('month',now()at time zone 'utc') + interval '-1 months'
and create_time <  date_trunc('month',now() at time zone 'utc')

Union all 
select count(id) as val, 'CountMonthLastYear' as Name
from asset
where create_time >=  date_trunc('month',now() at time zone 'utc') - interval '1 years'
and create_time <  date_trunc('month',now() at time zone 'utc') - interval '1 years - 1 months'
`

func getSummary1() (*SummaryAsset, error) {
	var items []itemDB
	if _, err := db.Query(&items, sqlSummary1); err != nil {
		log.Println(err)
	}
	d := make(map[string]int64)
	for _, it := range items {
		d[it.Name] = it.Val
	}
	total := d["Total"]
	monthCount := d["MonthTotal"]
	thisMonth := d["CountThisMonth"]
	lastMonth := d["CountLastMonth"]
	monthLastYear := d["CountMonthLastYear"]
	var ret SummaryAsset
	ret.Total = d["Total"]
	if monthLastYear > 0 {
		ret.MonthVsLastYear =
			float64(thisMonth-monthLastYear) / float64(monthLastYear)
	} else if thisMonth > 0 {
		ret.MonthVsLastYear = 1
	}
	if lastMonth > 0 {
		ret.MonthVsLastMonth =
			float64(thisMonth-lastMonth) / float64(lastMonth)
	} else if thisMonth > 0 {
		ret.MonthVsLastMonth = 1
	}

	if monthCount > 0 {
		ret.MonthAvg = float64(total) / float64(monthCount)
	}
	return &ret, nil
}

const sqlSummary2 = `
select count(distinct date_trunc('month',create_time)) as Val, 'MonthTotal'as Name 
from asset_change

Union all

  select count(id) as val, 'Total' as Name
  from asset_change

union ALL

select count(distinct date_trunc('day',create_time)) as Val, 'DayTotal'as Name 
from asset_change
`

func getSummary2() (*SummaryChange, error) {
	var items []itemDB
	if _, err := db.Query(&items, sqlSummary2); err != nil {
		log.Println(err)
	}
	d := make(map[string]int64)
	for _, it := range items {
		d[it.Name] = it.Val
	}
	total := d["Total"]
	monthCount := d["MonthTotal"]
	dayCount := d["DayTotal"]
	var ret SummaryChange
	ret.Total = total
	if monthCount > 0 {
		ret.MonthAvg = float64(total) / float64(monthCount)
	}
	if dayCount > 0 {
		ret.DayAvg = float64(total) / float64(dayCount)
	}
	return &ret, nil
}

const sqlSummary3 = `
  select count(id) as val, 'Total' as Name
  from asset_repair

union ALL
select count(id) as val, 'CountThisMonth' as Name
from asset_repair
where create_time >=  date_trunc('month', now() at time zone 'utc')

 Union all 
  
select count(id) as val, 'CountLastMonth' as Name 
from asset_repair
where create_time >=  date_trunc('month',now()at time zone 'utc') + interval '-1 months'
and create_time <  date_trunc('month',now() at time zone 'utc')

Union all 
select count(id) as val, 'CountMonthLastYear' as Name
from asset_repair
where create_time >=  date_trunc('month',now() at time zone 'utc') - interval '1 years'
and create_time <  date_trunc('month',now() at time zone 'utc') - interval '1 years - 1 months'
`

func getSummary3() (*SummaryRepair, error) {
	var items []itemDB
	if _, err := db.Query(&items, sqlSummary3); err != nil {
		log.Println(err)
	}
	d := make(map[string]int64)
	for _, it := range items {
		d[it.Name] = it.Val
	}
	total := d["Total"]
	thisMonth := d["CountThisMonth"]
	lastMonth := d["CountLastMonth"]
	monthLastYear := d["CountMonthLastYear"]
	var ret SummaryRepair
	ret.Total = total
	if monthLastYear > 0 {
		ret.MonthVsLastYear =
			float64(thisMonth-monthLastYear) / float64(monthLastYear)
	} else if thisMonth > 0 {
		ret.MonthVsLastYear = 1
	}
	if lastMonth > 0 {
		ret.MonthVsLastMonth =
			float64(thisMonth-lastMonth) / float64(lastMonth)
	} else if thisMonth > 0 {
		ret.MonthVsLastMonth = 1
	}

	return &ret, nil
}
