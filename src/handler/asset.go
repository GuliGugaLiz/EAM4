package handler

import (
	"github.com/gin-gonic/gin"
	//"github.com/go-pg/pg"
	"model"
)

func InitAsset(e *gin.Engine, r *gin.RouterGroup) {
	r.GET("/asset", listAsset)
	r.POST("/asset/import", importAsset)

	r.GET("/assetclass", listClass)
	r.GET("/department", listDept)
}

func listAsset(c *gin.Context) {
	var pb pageBind
	if err := c.BindQuery(&pb); err != nil {
		errorReturn(c, err)
		return
	}
	pb.CheckDefault()
	var list []model.Asset
	sql1 := `
    SELECT COUNT(id) FROM "asset" 
    `
	sql := `
    SELECT * FROM "asset" 
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

func listDept(c *gin.Context) {
	var pb pageBind
	if err := c.BindQuery(&pb); err != nil {
		errorReturn(c, err)
		return
	}
	pb.CheckDefault()
	var list []model.AssetDept
	sql1 := `
    SELECT COUNT(id) FROM "asset_dept" 
    `
	sql := `
    SELECT * FROM "asset_dept" 
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

func listClass(c *gin.Context) {
	var pb pageBind
	if err := c.BindQuery(&pb); err != nil {
		errorReturn(c, err)
		return
	}
	pb.CheckDefault()
	var list []model.AssetClass
	sql1 := `
    SELECT COUNT(id) FROM "asset_class" 
    `
	sql := `
    SELECT * FROM "asset_class" 
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
