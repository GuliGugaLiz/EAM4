package reader

import (
	"fmt"
)

var errCodes = map[byte]string{
	0x10: "command success",       // 命令成功完成
	0x11: "command fail",          //命令执行失败
	0x20: "command fail",          //
	0x21: "command fail",          //
	0x22: "antenna missing error", //天线未连接
	0x31: "command fail",          //
	0x40: "command fail",          //

	0x50: "command fail",         //
	0x56: "command fail",         //
	0x57: "output power too low", //输出功率过低

	0xEE: "fail to get rf port return loss", //测量回波损耗失败
}

func FormatErrCode(code byte) string {
	if v, ok := errCodes[code]; ok {
		return v
	}
	return fmt.Sprintf("0x%X", code)
}
