package handler

import (
	"github.com/gin-gonic/gin"
	"model"
)

func InitMaintainer(e *gin.Engine, r *gin.RouterGroup) {
	r.GET("/maintainer", listMaintainer)
}

func listMaintainer(c *gin.Context) {
	var pb pageBind
	if err := c.BindQuery(&pb); err != nil {
		errorReturn(c, err)
		return
	}
	pb.CheckDefault()
	var list []model.User
	sql1 := `
    SELECT COUNT(id) FROM "user" 
    `
	sql := `
    SELECT * FROM "user" 
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
