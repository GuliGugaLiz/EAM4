PLAT ?= none
PLATS = linux mingw

.PHONY : none  $(PLATS)

#ifneq ($(PLAT), none)

.PHONY : default

default :
	$(MAKE) $(PLAT)

#endif

none : 
	@echo "Please do 'make PLATFORM' where PLATFORM is one of these:"
	@echo "    $(PLATS)"

linux : GOPATH := $(CURDIR)/3rd:$(CURDIR)
mingw : GOPATH := $(CURDIR)/3rd;$(CURDIR)
export GOPATH

GOARCH = 386
export GOARCH

EXT := .exe
linux : EXT := 

#ifneq ($(GOOS), linux)
EXT := 
#endif

linux mingw :
	$(MAKE) dist PLAT=$@ 

env:
	export GOPATH
	set "GOPATH=%~dp0/3rd;%~dp0"
	set "PROMPT=(env) %PROMPT%"
	cmd

dep:
	#go get github.com/go-pg/pg
	#go get github.com/gin-gonic/gin
	go get github.com/gin-gonic/contrib/gzip
	go get github.com/dgrijalva/jwt-go
	go get github.com/tarm/goserial
	go get github.com/btcsuite/winsvc/winapi
	go get github.com/btcsuite/winsvc/svc
	go get github.com/btcsuite/winsvc/mgr
	go get github.com/btcsuite/winsvc/registry
	go get github.com/btcsuite/winsvc/eventlog

dist:
	go build -o dist/client/eam_client$(EXT) reader_client
	go build -o dist/server/engine$(EXT) engine
	go build -o dist/server/engine_web$(EXT) engine_web

test:dep
	#go test 

clean : 
	rm -r dist
