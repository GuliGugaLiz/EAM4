package handler

import (
	"fmt"
	"github.com/360EntSecGroup-Skylar/excelize"
	"github.com/gin-gonic/gin"
	"github.com/go-pg/pg"
	"log"
	"model"
	"strconv"
	"strings"
	"time"
)

var mustAssetHeaders = []string{
	"EPC编码", "名称", "资产分类", "使用部门",
}

func importAsset(c *gin.Context) {
	_ = log.Println
	file, _ := c.FormFile("file")
	if file != nil {
		if f, err := file.Open(); err != nil {
			errorReturn(c, err)
			return
		} else {
			//log.Println(file.Filename)
			xlsx, err1 := excelize.OpenReader(f)
			if err1 != nil {
				errorReturn(c, err1)
				return
			}
			rows := xlsx.GetRows("sheet1")
			count := len(rows)
			//log.Println(count)
			if count > 1 {
				//sz := count - 1
				headers := rows[0]
				if len(headers) > 0 {
					dict := map[string]int{}
					dictV := map[int]string{}
					dictMust := map[string]bool{}
					for idx, header := range headers {
						dict[header] = idx
						dictV[idx] = header
					}
					for _, h := range mustAssetHeaders {
						if _, ok := dict[h]; !ok {
							errorHandle(c, "模版必须包含:"+h)
							return
						}
						dictMust[h] = true
					}
					items := make([]*model.Asset, 0)
					assetClasss := make(map[string]bool, 0)
					assetDepts := make(map[string]bool, 0)
					epcs := make([]string, 0)
					epcDict := make(map[string]int, 0)
					now := time.Now().UTC()
					user, _ := getCurrentUser(c)
					account := user.Account
					existsEpcs := make([]string, 0)
					for i, row := range rows[1:] {
						rowIdx := i + 1
						vals := map[string]string{}
						for idx, cell := range row {
							key := dictV[idx]
							_, ok := dictMust[key]
							if cell == "" && ok { // must input
								errorHandle(c, fmt.Sprintf("行[%d]必须包含: %s", rowIdx, key))
								return
							}
							vals[key] = cell
						}
						/*	var (
							//lng float64
							//lat float64
							err error
						)*/
						/*if v, ok := valToFloat(c, vals["经度"], "经度", rowIdx); !ok {
							return
						} else {
							lng = v
						}

						if v, ok := valToFloat(c, vals["纬度"], "纬度", rowIdx); !ok {
							return
						} else {
							lng = v
						}*/
						//get class name into slice
						//get dept name into slice

						epc := strings.TrimSpace(vals["EPC编码"])
						epcDict[epc] = epcDict[epc] + 1
						if epcDict[epc] == 2 { // exists two epc in xlsx
							existsEpcs = append(existsEpcs, epc)
						}
						epcs = append(epcs, epc)

						assetClass := strings.TrimSpace(vals["资产分类"])
						assetClasss[assetClass] = true
						assetDept := strings.TrimSpace(vals["使用部门"])
						assetDepts[assetDept] = true
						item := model.Asset{
							//EPC编码	名称	资产分类	使用部门	机身码
							EPC:        epc,
							Name:       vals["名称"],
							BodyNumber: vals["机身码"],

							AssetClassName: assetClass, // not save
							AssetDeptName:  assetDept,  // not save

							//品牌	型号	配置	购置日期	原始价值
							Brand:         vals["品牌"],
							Model:         vals["型号"],
							Configure:     vals["配置"],
							PurchaseDate:  nil, //vals["购置日期"],
							PurchaseValue: float64OrNull(vals["原始价值"]),

							//目前价值	保修期(月)	供应商	资产来源	入网时间
							CurrentValue: float64OrNull(vals["目前价值"]),
							Warranty:     int32OrNull(vals["保修期(月)"]),
							Supplier:     vals["供应商"],
							Source:       vals["资产来源"],
							InNetTime:    nil, //vals["入网时间"],

							//存放地点	使用状态	维护人员	使用人	备注
							StorageLocation: vals["存放地点"],
							UseStateId:      1, // vals["使用状态"],
							Maintainer:      vals["维护人员"],
							User:            vals["使用人"],
							Memo:            vals["备注"],

							CreateAccount: account,
							CreateTime:    now,
						}
						items = append(items, &item)
					}
					if len(existsEpcs) > 0 {
						exists := strings.Join(existsEpcs, ",")
						errorHandle(c, "上传文件中存在相同的EPC：\n"+exists)
						return
					}
					if len(epcs) == 0 {
						errorHandle(c, "上传文件中没有包含资产信息")
						return
					}
					//check class and dept in db
					if notIns, d, err := checkValInDb(db, assetClasss,
						"name", "asset_class"); err != nil {
						errorReturn(c, err)
						return
					} else {
						if len(notIns) > 0 {
							str := strings.Join(notIns, ",")
							errorHandle(c, "上传文件中资产分类在数据库中不存在：\n"+str)
							return
						}
						for i := 0; i < len(items); i++ {
							it := items[i]
							name := it.AssetClassName
							id := d[name]
							it.ClassId = &id
							log.Println(it.ClassId)
						}
					}
					if notIns, d, err := checkValInDb(db, assetDepts,
						"name", "asset_dept"); err != nil {
						errorReturn(c, err)
						return
					} else {
						if len(notIns) > 0 {
							str := strings.Join(notIns, ",")
							errorHandle(c, "上传文件中使用部门在数据库中不存在：\n"+str)
							return
						}
						for i := 0; i < len(items); i++ {
							it := items[i]
							name := it.AssetDeptName
							id := d[name]
							it.DeptId = &id
							log.Println(it.DeptId)
						}
					}

					//check if epc exists in db
					var exists []string
					const sql = `
                        SELECT epc FROM "asset"
                        WHERE epc in (?)
                    `
					if _, err := db.Query(&exists, sql, pg.In(epcs)); err != nil {
						errorReturn(c, err)
						return
					}
					if len(exists) > 0 {
						str := strings.Join(exists, ",")
						errorHandle(c, "上传文件中EPC在数据库中已存在：\n"+str)
						return
					}
					if err := insertAsset(db, items); err != nil {
						errorReturn(c, err)
						return
					}

				}
			}
		}
	}
	c.JSON(200, gin.H{
		"status": "ok",
	})
}

func insertAsset(db *pg.DB, items []*model.Asset) error {
	if tx, err := db.Begin(); err != nil {
		return err
	} else {
		defer tx.Rollback()
		log.Printf("%v\n", items)
		log.Printf("%d, %d\n", items[0].ClassId, items[0].DeptId)
		if err := tx.Insert(&items); err != nil {
			return err
		}
		for _, it := range items {
			// connect to tag or update to tag
			now := time.Now().UTC() // record to db
			sql := `
insert into tag(epc, asset_id, create_time, last_state) 
    values(?, ?, ?, 0)
ON conflict(epc) 
DO UPDATE SET 
    asset_id = ? 
            `
			if _, err := db.Exec(sql,
				it.EPC, it.Id, now, it.Id); err != nil {
				return err
			}
		}
		tx.Commit()
	}
	return nil
}

type nameId struct {
	Id   int64
	Name string
}

// find names not in db  then return the name with id
func checkValInDb(db *pg.DB, dict map[string]bool,
	column, dbname string) ([]string, map[string]int64, error) {
	vals := make([]string, 0)
	for k, _ := range dict {
		vals = append(vals, k)
	}
	var names []nameId
	const sql = `SELECT %s as Name, id FROM %s WHERE %s IN (?)`
	if _, err := db.Query(&names,
		fmt.Sprintf(sql, column, dbname, column),
		pg.In(vals)); err != nil {
		return nil, nil, err
	}
	d := make(map[string]bool)
	dv := make(map[string]int64) // id and name in db
	for _, it := range names {
		d[it.Name] = true
		dv[it.Name] = it.Id
	}
	notIns := make([]string, 0)
	for k, _ := range dict {
		if _, ok := d[k]; !ok {
			notIns = append(notIns, k)
		}
	}
	return notIns, dv, nil
}

func int64OrNull(s string) *int64 {
	if v, err := strconv.ParseInt(s, 10, 64); err != nil {
		return nil
	} else {
		return &v
	}
}

func int32OrNull(s string) *int32 {
	if v, err := strconv.ParseInt(s, 10, 32); err != nil {
		return nil
	} else {
		v2 := int32(v)
		return &v2
	}
}

func float64OrNull(s string) *float64 {
	if v, err := strconv.ParseFloat(s, 64); err != nil {
		return nil
	} else {
		return &v
	}
}

func valToFloat(c *gin.Context,
	val string, name string, rowIdx int) (float64, bool) {
	if v, err := strconv.ParseFloat(val, 64); err != nil {
		errorHandle(c, fmt.Sprintf("行[%d]的%s[%s]不是数字格式",
			rowIdx, name, val))
		return 0, false
	} else {
		return v, true
	}
}
