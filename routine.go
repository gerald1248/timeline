package main

import (
	"encoding/json"
	"fmt"
	"github.com/llgcode/draw2d"
	"github.com/xeipuuv/gojsonschema"
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

	bytes, err := staticTimelineSchemaJsonBytes()
	if err != nil {
		return Result{fmt.Sprintf("can't retrieve schema file: %v\n", err), 1}
	}

	schemaLoader := gojsonschema.NewStringLoader(string(bytes))
	documentLoader := gojsonschema.NewStringLoader(string(buffer))

	result, err := gojsonschema.Validate(schemaLoader, documentLoader)
    if err != nil {
        return Result{fmt.Sprintf("Error: %s\n", err.Error()), 1}
    }

    if !result.Valid() {
    	//TODO: combine
        fmt.Printf("Invalid JSON:\n")
        for _, desc := range result.Errors() {
            fmt.Printf("- %s\n", desc)
        }
        return Result{fmt.Sprintf("Invalid JSON: %s\n", result.Errors()[0]), 1}
    }

	var data Data
	if err := json.Unmarshal(buffer, &data); err != nil {
		return Result{fmt.Sprintf("JSON unmarshaling failed: %s\n", err), 1}
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
