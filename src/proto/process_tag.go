package proto

import (
	"encoding/json"
	"fmt"
	"log"
	"model"
	"strings"
	"time"

	"github.com/go-pg/pg"
)

// return tagstate , conflictepcs list
func runTagData(data []byte, db *pg.DB) (string, string) {
	var upload Upload
	if err := json.Unmarshal(data, &upload); err != nil {
		log.Println(err)
		return "", ""
	}
	//check is site change
	conflictepcs := checkTagMoveSite(db, &upload)

	sz1 := loopTag(db, upload.Add, 1)
	var state model.FileTagState
	if sz1 > 0 {
		state.Add = &sz1
		log.Println("add tag count:", sz1)
	}
	sz2 := loopTag(db, upload.Lost, 2)
	if sz2 > 0 {
		state.Lost = &sz2
		log.Println("lost tag count:", sz2)
	}
	sz3 := loopTag(db, upload.Change, 1)
	if sz3 > 0 {
		state.Change = &sz3
		log.Println("change tag count:", sz3)
	}
	sz4 := loopTag(db, upload.Current, 1)
	if sz4 > 0 {
		state.Current = &sz4
		log.Println("current tag count:", sz4)
	}

	if stateJson, err := json.MarshalIndent(state, "", "  "); err != nil {
		log.Println(err)
		return "", ""
	} else {
		return string(stateJson), conflictepcs
	}
}

func checkTagMoveSite(db *pg.DB, upload *Upload) string {
	// use db.Begin()
	// to refactor: this one will update tag twice
	utcNow := time.Now().UTC()
	epcs := make([]string, 0)
	dict := make(map[string]Tag)

	if upload.Add != nil && len(upload.Add) > 0 {
		for _, tag := range upload.Add {
			epcs = append(epcs, tag.EPC)
			dict[tag.EPC] = tag
		}
	}

	if upload.Current != nil && len(upload.Current) > 0 {
		for _, tag := range upload.Current {
			epcs = append(epcs, tag.EPC)
			dict[tag.EPC] = tag
		}
	}
	if len(epcs) > 0 {
		readerId := dict[epcs[0]].ReaderId
		conflictEPCs := make([]string, 0)
		log.Printf("CheckTagMoveSite: [%s], %d\n", readerId, len(epcs))
		var tags []model.Tag
		const sql = `
        SELECT * FROM "tag"
            WHERE reader_id != ?
                AND epc IN (?)
                    `
		if _, err := db.Query(&tags, sql, readerId, pg.In(epcs)); err != nil {
			log.Println(err)
			return ""
		}
		if len(tags) == 0 {
			return ""
		}
		var currentSiteId int64
		if _, err := db.Query(&currentSiteId,
			`
            select site_id from reader where reader_id = ? 
            `, readerId); err != nil {
			log.Println(err)
		}
		var updates []model.Tag
		var changes []model.AssetChange
		for _, tag := range tags {
			if tag.LastState == 0 || tag.LastState == 2 {
				change := model.AssetChange{
					EPC:             tag.EPC,
					AssetId:         tag.AssetId,
					CreateTime:      utcNow,
					LastReaderId:    tag.ReaderId,
					LastSiteId:      tag.SiteId,
					CurrentSiteId:   &currentSiteId,
					CurrentReaderId: readerId,
					IsPass:          false,
				}
				changes = append(changes, change)
			} else {
				conflictEPCs = append(conflictEPCs, tag.EPC)
				tag.ConflictReaderId = readerId
				updates = append(updates, tag)
			}
		}
		if len(updates) > 0 {
			if _, err := db.Model(&updates).
				Column("conflict_reader_id").
				Update(); err != nil {
				log.Println(err)
				return ""
			}
		}
		if len(changes) > 0 {
			if err := db.Insert(&changes); err != nil {
				log.Println(err)
				return ""
			}
		}
		//DONE: check epcs is in db and the state is lost
		//DONE: make new change
		//DONE: and make the state conflict on mark
		if len(conflictEPCs) > 0 {
			log.Printf("GetConflictEPC: [%s], %d\n", readerId, len(conflictEPCs))
			return strings.Join(conflictEPCs, ",")
		}
	}
	return ""
}

func loopTag(db *pg.DB, tags []Tag, state int16) int {
	if tags != nil && len(tags) > 0 {
		var currentSiteId int64
		if _, err := db.Query(&currentSiteId,
			`
            select site_id from reader where reader_id = ? 
            `, tags[0].ReaderId); err != nil {
			log.Println(err)
		}

		for _, tag := range tags {
			updateTag(db, tag, state, currentSiteId)
		}
		return len(tags)
	}
	return 0
}

func updateTag(db *pg.DB,
	tag Tag, state int16, siteId int64) {
	now := time.Now().UTC() // record to db
	sql := `
insert into tag(epc, reader_id, create_time, last_update,
last_check, lost,  last_ant, last_state, site_id) 
    values(?, ?, ?, ?,
?, ?, ?, ?, ?)
ON conflict(epc) 
DO UPDATE SET 
    last_update = ?, last_check = ?,
    lost = ?, last_ant = ?, last_state = ?,
    reader_id = ?, site_id = ?
    ,epc = ?
            `
	//log.Printf("%d, %d\n", len(tag.EPC), len(tag.ReaderId))
	readerId := tag.ReaderId
	epc := tag.EPC
	if _, err := db.Exec(sql,
		epc, readerId, now, now,
		tag.LastCheck, tag.Lost, tag.Ant, state, siteId,
		now, tag.LastCheck, tag.Lost, tag.Ant,
		state, readerId, siteId, epc); err != nil {
		msg := fmt.Sprintf("save tag got error:%s", err)
		log.Println(msg)
	}
}
