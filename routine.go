package main

import (
	"encoding/json"
	"fmt"
	"github.com/llgcode/draw2d"
	"io/ioutil"
	"strings"
	"time"
)

func processFile(input string) Result {
	start := time.Now()

	buffer, err := ioutil.ReadFile(input)
	if err != nil {
		return Result{fmt.Sprintf("can't read input file: %v\n", err), 1}
	}

	var data Data
	if err := json.Unmarshal(buffer, &data); err != nil {
		return Result{fmt.Sprintf("JSON unmarshaling failed: %s", err), 1}
	}

	enrichData(&data)

	errNo, errString := validateData(&data)
	if errNo > 0 {
		return Result{fmt.Sprintf(errString), 1}
	}

	bare := strings.Replace(strings.ToLower(input), ".json", "", -1)
	ext := ".png"
	concat := strings.Join([]string{bare, ext}, "")

	draw2d.SetFontFolder("./resource/font")
	drawScene(&data, concat)

	secs := time.Since(start).Seconds()

	return Result{fmt.Sprintf("%s: %.2fs", concat, secs), 0}
}
