package main

import (
	"encoding/json"
	"fmt"
	"io/ioutil"
	"strings"
	"time"
)

func processFile(input string, ch chan<- Result) {
	start := time.Now()

	buffer, err := ioutil.ReadFile(input)
	if err != nil {
		ch <- Result{fmt.Sprintf("can't read input file: %v\n", err), 1}
		return
	}

	var data Data
	if err := json.Unmarshal(buffer, &data); err != nil {
		ch <- Result{fmt.Sprintf("JSON unmarshaling failed: %s", err), 1}
		return
	}

	enrichData(&data)

	errNo, errString := validateData(&data)
	if errNo > 0 {
		ch <- Result{fmt.Sprintf(errString), 1}
		return
	}

	bare := strings.Replace(strings.ToLower(input), ".json", "", -1)
	ext := ".png"
	concat := strings.Join([]string{bare, ext}, "")

	drawScene(&data, concat)

	secs := time.Since(start).Seconds()

	ch <- Result{fmt.Sprintf("%s: %.2fs", concat, secs), 0}
}