package main

import (
	"flag"
	"fmt"
	"github.com/gin-gonic/contrib/gzip"
	"github.com/gin-gonic/gin"
	"github.com/go-pg/pg"
	"handler"
	"log"
	"net/http"
	"os"
	"proto"
	"service"
)

func init() {
	log.SetPrefix("WEB:")
	log.SetFlags(log.Lmicroseconds | log.Lshortfile)
}

var install = flag.Bool("install", false, "install services")
var remove = flag.Bool("remove", false, "remove services")
var svc = flag.Bool("svc", false, "run on services")
var start = flag.Bool("start", false, "start services")
var stop = flag.Bool("stop", false, "stop services")

var name = "EAM_engine_web"
var displayName = "EAM_engine_web"
var desc = "EAM engine for web serivce"

func main() {
	flag.Parse()
	var (
		s   service.Service
		err error
	)
	if s, err = service.NewService(name, displayName, desc); err != nil {
		fmt.Printf("%s unable to start: %s\n", displayName, err)
		return
	}

	if *install {
		if err = s.Install(); err != nil {
			fmt.Printf("Failed to install: %s\n", err)
			return
		}
		fmt.Printf("Service \"%s\" installed.\n", displayName)
		return
	}

	if *remove {
		if err = s.Remove(); err != nil {
			fmt.Printf("Failed to remove: %s\n", err)
			return
		}
		fmt.Printf("Service \"%s\" removed.\n", displayName)
		return
	}
	if *start {
		if err = s.Start(); err != nil {
			fmt.Printf("Failed to start: %s\n", err)
			return
		}
		fmt.Printf("Service \"%s\" started.\n", displayName)
		return
	}
	if *stop {
		if err = s.Stop(); err != nil {
			fmt.Printf("Failed to stop: %s\n", err)
			return
		}
		fmt.Printf("Service \"%s\" stopped.\n", displayName)
		return
	}
	if *svc {
		if err = s.Run(func() error {
			go doWork() // start
			return nil
		}, func() error {
			stopWork() //stop
			return nil
		}); err != nil {
			s.Error(err.Error())
		}
		return
	} else {
		doWork() // not in service
	}
}

var db *pg.DB
var server *http.Server

func stopWork() {
	server.Close()
}

func doWork() {
	setting := proto.GetSetting()

	dbsetting := setting.DB
	dbAddr := fmt.Sprintf("%s:%d", dbsetting.Host, dbsetting.Port)

	db = pg.Connect(&pg.Options{
		Addr:     dbAddr,
		User:     dbsetting.User,
		Password: dbsetting.Password,
		Database: dbsetting.Database,
	})

	if _, err := db.Exec("select 1;"); err != nil {
		log.Fatal(err)
	}

	defer db.Close()

	addr := fmt.Sprintf("%s:%d", "", setting.WebPort)

	r := gin.Default()

	r.Use(gzip.Gzip(gzip.BestCompression))

	handler.InitDB(db)
	handler.InitHandler(r, r.Group("/api"))

	r.LoadHTMLFiles("./static/index.html")
	r.GET("/", index)
	r.GET("/lucky", lucky)
	r.Static("/static", "./static")
	r.StaticFile("/favicon.ico", "./static/favicon.ico")
	r.StaticFile("/favicon.png", "./static/favicon.png")
	Run(r, addr)
}

func Run(engine *gin.Engine, addr ...string) (err error) {
	defer func() { debugPrintError(err) }()

	address := resolveAddress(addr)
	debugPrint("Listening and serving HTTP on %s\n", address)
	err = http.ListenAndServe(address, engine)
	return
}

func ListenAndServe(addr string, handler http.Handler) error {
	server = &http.Server{Addr: addr, Handler: handler}
	return server.ListenAndServe()
}

func debugPrint(format string, values ...interface{}) {
	if gin.IsDebugging() {
		log.Printf("[GIN-debug] "+format, values...)
	}
}

func debugPrintError(err error) {
	if err != nil {
		debugPrint("[ERROR] %v\n", err)
	}
}

func resolveAddress(addr []string) string {
	switch len(addr) {
	case 0:
		if port := os.Getenv("PORT"); port != "" {
			debugPrint("Environment variable PORT=\"%s\"", port)
			return ":" + port
		}
		debugPrint("Environment variable PORT is undefined. Using port :8080 by default")
		return ":8080"
	case 1:
		return addr[0]
	default:
		panic("too much parameters")
	}
}

func index(c *gin.Context) {
	c.HTML(http.StatusOK, "index.html", gin.H{})
}

func lucky(c *gin.Context) {
	c.JSON(200, gin.H{
		"message": "I feel lucky",
	})
}
