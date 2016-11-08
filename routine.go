package main

import (
	"encoding/json"
	"fmt"
	"io/ioutil"
	"strings"
	"time"
)

func processFile(input string, ch chan<- string) {
	start := time.Now()

	buffer, err := ioutil.ReadFile(input)
	if err != nil {
		ch <- fmt.Sprintf("can't read input file: %v\n", err)
		return
	}

	var data Data
	if err := json.Unmarshal(buffer, &data); err != nil {
		ch <- fmt.Sprintf("JSON unmarshaling failed: %s", err)
		return
	}

	enrichData(&data)

	errNo, errString := validateData(&data)
	if errNo > 0 {
		ch <- fmt.Sprintf(errString)
		return
	}

	output := strings.Replace(strings.ToLower(input), ".json", ".png", -1)
	drawScene(&data, output)

	secs := time.Since(start).Seconds()

	ch <- fmt.Sprintf("%s: %.2fs", input, secs)
}