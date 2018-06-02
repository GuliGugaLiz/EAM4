package reader

import (
	"fmt"
	"testing"
)

func Test_Main(t *testing.T) {
	var (
		rcuId string
		err   error
	)
	rcuId, err = GetRCUId()
	fmt.Printf("%s, %v\n", rcuId, err)
	comName, err := GetComFile()
	fmt.Printf("%s\n", comName)
}

func Test_GetEPCList(t *testing.T) {
	if _, tags, err := GetEPCList(4); err != nil {
		fmt.Println(err)
	} else {
		for _, tag := range tags {
			fmt.Printf("%s\n", tag.EPC)
		}
		//fmt.Println("tags:", tags)
		//fmt.Println("msg:", msg)
	}

}
