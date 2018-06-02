package handler

import (
	"fmt"
	"github.com/gin-gonic/gin"
	"log"
	"model"
)

func InitReader(e *gin.Engine, r *gin.RouterGroup) {
	_ = log.Println
	r.GET("/reader", listReader)
	r.GET("/reader/get", getReader)
	r.POST("/reader/update", updateReader)
}

func getReader(c *gin.Context) {
	id := int64OrNull(c.DefaultQuery("id", ""))
	if id == nil {
		errorHandle(c, "id is empty or invalid")
		return
	}
	const sql = `
select r.*, 
s.name as site_name
from reader r
  left join site s on r.site_id = s.id
where r.id = ? 
    `
	var item model.Reader
	if _, err := db.QueryOne(&item, sql, *id); err != nil {
		errorReturn(c, err)
		return
	}
	c.JSON(200, gin.H{
		"status": "ok",
		"record": item,
	})
}

func listReader(c *gin.Context) {
	var pb pageBind
	if err := c.BindQuery(&pb); err != nil {
		errorReturn(c, err)
		return
	}
	pb.CheckDefault()
	var list []model.Reader
	const viewSql = `
select r.*, 
s.name as site_name
from reader r
  left join site s on r.site_id = s.id
    `

	sql1 := fmt.Sprintf(`
    SELECT COUNT(id) FROM (%s) a
    `, viewSql)
	sql := fmt.Sprintf(`
    SELECT * FROM (%s) a
    ORDER BY create_time desc
    LIMIT ? offset ?
    `, viewSql)
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

type readerModel struct {
	Id     int64
	SiteId int64
	Memo   string
}

func updateReader(c *gin.Context) {
	var m readerModel
	if err := c.Bind(&m); err != nil {
		errorReturn(c, err)
		return
	}
	log.Println(m)
	if _, err := getCurrentUser(c); err != nil {
		errorReturn(c, err)
		return
	} else {
		var item model.Reader
		const sql = `select * from "reader" where id= ? `
		if _, err := db.QueryOne(&item,
			sql, m.Id); err != nil {
			errorReturn(c, err)
			return
		}
		item.SiteId = m.SiteId
		item.Memo = m.Memo
		if err := db.Update(&item); err != nil {
			errorReturn(c, err)
			return
		}
	}

	c.JSON(200, gin.H{
		"status": "ok",
	})
}
