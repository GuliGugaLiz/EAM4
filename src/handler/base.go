package handler

import (
	"github.com/gin-gonic/gin"
	"log"
)

type pageBind struct {
	CurrentPage int64 `form:"currentPage,default=1"`
	PageSize    int64 `form:"pageSize,default=10"`
	Index       int64
	Query       string `form:"query"`
}

func (p *pageBind) CheckDefault() {
	p.Index = (p.CurrentPage - 1) * p.PageSize
}

func (p pageBind) Response(total int64) map[string]int64 {
	return map[string]int64{
		"current":  p.CurrentPage,
		"pageSize": p.PageSize,
		"total":    total,
	}
}

func errorReturn(c *gin.Context, err error) {
	log.Println(err)
	c.JSON(200, gin.H{
		"status":  "error",
		"message": err.Error(),
	})
}

func errorHandle(c *gin.Context, msg string) {
	c.JSON(200, gin.H{
		"status":  "error",
		"message": msg,
	})
}
