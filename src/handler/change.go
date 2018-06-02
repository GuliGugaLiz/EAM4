package handler

import (
	"fmt"
	"github.com/gin-gonic/gin"
	"model"
)

func InitChange(e *gin.Engine, r *gin.RouterGroup) {
	r.GET("/change", listChange)
}

type searchChange struct {
	pageBind
	Name string
}

func listChange(c *gin.Context) {
	var pb searchChange
	if err := c.BindQuery(&(pb.pageBind)); err != nil {
		errorReturn(c, err)
		return
	}
	//log.Printf("%v\n", pb)
	pb.CheckDefault()
	//log.Printf("%v\n", pb)
	const viewSql = `
select ac.*, 
a.name as asset_name,
ls.name as last_site_name,
cs.name as current_site_name,
u.account as check_user_account
from asset_change ac
  left join asset a on a.id = ac.asset_id
  left join site ls on ls.id = ac.last_site_id
  left join site cs on cs.id = ac.current_site_id
  left join "user" u on u.id = ac.check_user_id
    `
	var list []model.AssetChange
	sql1 := fmt.Sprintf(`
    SELECT COUNT(id) FROM (%s) a
    `, viewSql)
	where := ""
	/*
		if pb.DeviceGuid != "" {
			where = " where _guid like ? "
			sql1 = sql1 + where
		}*/
	sql := fmt.Sprintf(`SELECT * FROM (%s) a `, viewSql)
	sql = sql + where
	sql = sql + `
    ORDER BY create_time desc
    LIMIT ? offset ?
    `
	//guid := fmt.Sprintf("%%%s%%", pb.DeviceGuid)
	guid := ""
	var total int64
	if where == "" {
		if _, err := db.QueryOne(&total, sql1); err != nil {
			errorReturn(c, err)
			return
		}
		if _, err := db.Query(&list, sql, pb.PageSize, pb.Index); err != nil {
			errorReturn(c, err)
			return
		}
	} else {
		if _, err := db.QueryOne(&total, sql1, guid); err != nil {
			errorReturn(c, err)
			return
		}
		if _, err := db.Query(&list, sql, guid,
			pb.PageSize, pb.Index); err != nil {
			errorReturn(c, err)
			return
		}
	}
	c.JSON(200, gin.H{
		"list":       list,
		"pagination": pb.Response(total),
	})
}
