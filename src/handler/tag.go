package handler

import (
	"fmt"
	"github.com/gin-gonic/gin"
	"model"
	"strconv"
	"strings"
)

func InitTag(e *gin.Engine, r *gin.RouterGroup) {
	r.GET("/tag", listTag)
}

type tagBind struct {
	pageBind
	EPC       string
	LastState []int
}

func listTag(c *gin.Context) {
	var pb tagBind
	if err := c.BindQuery(&(pb.pageBind)); err != nil {
		errorReturn(c, err)
		return
	}
	if err := c.BindQuery(&pb); err != nil {
		errorReturn(c, err)
		return
	}
	pb.CheckDefault()
	var list []model.TagView
	var wheres []string
	var vals []interface{}
	if pb.EPC != "" {
		wheres = append(wheres, " epc like ? ")
		vals = append(vals, fmt.Sprintf("%%%s%%", pb.EPC))
	}
	if len(pb.LastState) > 0 {
		var strs []string
		for _, v := range pb.LastState {
			strs = append(strs, strconv.Itoa(v))
		}
		wheres = append(wheres, fmt.Sprintf(" last_state in (%s) ",
			strings.Join(strs, ",")))
	}
	where := ""
	if len(wheres) > 0 {
		where = " WHERE " + strings.Join(wheres, " AND ")
	}
	const viewSql = `
select t.*, 
a.id as asset_id, a.name as asset_name,
s.id as site_id, s.name as site_name
from tag t
  left join asset a on t.asset_id = a.id
  left join reader r on t.reader_id = r.reader_id
  left join site s on t.site_id = s.id
    `
	sql1 := fmt.Sprintf(`
    SELECT COUNT(id) FROM (%s) v
    `+where, viewSql)

	sql := fmt.Sprintf(`
    SELECT * FROM (%s) v `, viewSql)

	sql = sql + where + `
    ORDER BY create_time desc
    LIMIT ? offset ?
    `

	var total int64

	if len(vals) == 0 {
		if _, err := db.QueryOne(&total, sql1); err != nil {
			errorReturn(c, err)
			return
		}
	} else {
		if _, err := db.QueryOne(&total, sql1, vals); err != nil {
			errorReturn(c, err)
			return
		}
	}
	vals = append(vals, pb.PageSize)
	vals = append(vals, pb.Index)
	if _, err := db.Query(&list, sql, vals...); err != nil {
		errorReturn(c, err)
		return
	}
	c.JSON(200, gin.H{
		"list":       list,
		"pagination": pb.Response(total),
	})
}
