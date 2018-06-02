package handler

import (
	"fmt"
	"github.com/360EntSecGroup-Skylar/excelize"
	"github.com/gin-gonic/gin"
	"log"
	"model"
	"strconv"
	"strings"
	"time"
)

func InitSite(e *gin.Engine, r *gin.RouterGroup) {
	r.GET("/site", listSite)
	r.GET("/site/search", searchSite)
	r.POST("/site/import", importSite)
}

var mustSiteHeaders = []string{
	"省份", "城市", "基站名称", "经度", "纬度",
}

func importSite(c *gin.Context) {
	file, _ := c.FormFile("file")
	if file != nil {
		if f, err := file.Open(); err != nil {
			errorReturn(c, err)
			return
		} else {
			log.Println(file.Filename)
			xlsx, err1 := excelize.OpenReader(f)
			if err1 != nil {
				errorReturn(c, err1)
				return
			}
			rows := xlsx.GetRows("sheet1")
			count := len(rows)
			log.Println(count)
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
					for _, h := range mustSiteHeaders {
						if _, ok := dict[h]; !ok {
							errorHandle(c, "模版必须包含:"+h)
							return
						}
						dictMust[h] = true
					}
					items := make([]model.Site, 0)
					now := time.Now().UTC()
					user, _ := getCurrentUser(c)
					account := user.Account
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
						var (
							lng float64
							lat float64
							err error
						)
						if lng, err = strconv.ParseFloat(vals["经度"], 64); err != nil {
							errorHandle(c, fmt.Sprintf("行[%d]的经度[%s]不是数字格式",
								rowIdx, vals["经度"]))
							return
						}
						if lat, err = strconv.ParseFloat(vals["纬度"], 64); err != nil {
							errorHandle(c, fmt.Sprintf("行[%d]的纬度[%s]不是数字格式",
								rowIdx, vals["纬度"]))
							return
						}
						//TODO: check if name exists
						site := model.Site{
							//"省份", "城市",  "基站名称", "经度", "纬度",
							Province:      vals["省份"],
							City:          vals["城市"],
							District:      vals["地区"],
							Name:          vals["基站名称"],
							Address:       vals["地址"],
							Lng:           lng,
							Lat:           lat,
							CreateAccount: account,
							CreateTime:    now,
						}
						items = append(items, site)
					}
					if err := db.Insert(&items); err != nil {
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

type siteListView struct {
	Id   int64
	Name string
}

func searchSite(c *gin.Context) {
	var pb pageBind
	if err := c.BindQuery(&pb); err != nil {
		errorReturn(c, err)
		return
	}
	var items []siteListView
	sql := `
    SELECT id, name FROM "site" 
        WHERE name LIKE ?
    ORDER BY create_time desc
    `
	query := fmt.Sprintf("%%%s%%",
		strings.TrimSpace(pb.Query))
	if _, err := db.Query(&items, sql, query); err != nil {
		errorReturn(c, err)
		return
	}
	c.JSON(200, gin.H{
		"status":  "ok",
		"results": items,
	})
}

func listSite(c *gin.Context) {
	var pb pageBind
	if err := c.BindQuery(&pb); err != nil {
		errorReturn(c, err)
		return
	}
	pb.CheckDefault()
	var list []model.Site
	sql1 := `
    SELECT COUNT(id) FROM "site" 
    `
	sql := `
    SELECT * FROM "site" 
    ORDER BY create_time desc
    LIMIT ? offset ?
    `
	var total int64
	if _, err := db.QueryOne(&total, sql1); err != nil {
		errorReturn(c, err)
		return
	}
	if _, err := db.Query(&list, sql, pb.PageSize, pb.Index); err != nil {
		errorReturn(c, err)
		return
	}
	c.JSON(200, gin.H{
		"list":       list,
		"pagination": pb.Response(total),
	})
}
