package main

import (
	"encoding/json"
	"fmt"
	//"github.com/fogleman/gg"
	"github.com/xeipuuv/gojsonschema"
	"io/ioutil"
	"strings"
	"time"
)

func processFile(inputPath string, ch chan<- ShortResult) {
	start := time.Now()

	buffer, err := ioutil.ReadFile(inputPath)
	if err != nil {
		ch <- ShortResult{fmt.Sprintf("can't read input file: %v\n", err), 1}
		return
	}

	result := processBytes(buffer)

	//output filename
	bare := strings.Replace(strings.ToLower(inputPath), ".json", "", -1)
	ext := ".png"
	outputPath := strings.Join([]string{bare, ext}, "")

	if result.Code > 0 {
		fmt.Printf("%s\n", result.Message)
		ch <- ShortResult{fmt.Sprintf("%s: %s\n", outputPath, result.Message), 1}
		return
	}

	//save to file
	result.Context.SavePNG(outputPath)

	secs := time.Since(start).Seconds()

	ch <- ShortResult{fmt.Sprintf("%s: %.2fs", outputPath, secs), 0}
	return
}

func processBytes(bytes []byte) Result {
	start := time.Now()

	i18n, msg := getI18n()
	if msg != "" {
		return Result{fmt.Sprintf("Can't read i18n table: %s\n", msg), 1, nil}
	}

	//staticTimelineSchemaJsonBytes func taken from bindata.go; if function name doesn't match, go get -u helps
	schemaBytes, err := staticTimelineSchemaJsonBytes()
	if err != nil {
		return Result{fmt.Sprintf("Can't read schema file: %v\n", err), 1, nil}
	}

	schemaLoader := gojsonschema.NewStringLoader(string(schemaBytes))
	documentLoader := gojsonschema.NewStringLoader(string(bytes))

	result, err := gojsonschema.Validate(schemaLoader, documentLoader)
	if err != nil {
		return Result{fmt.Sprintf("Can't validate JSON: %s\n", err.Error()), 1, nil}
	}

	if !result.Valid() {
		fmt.Printf("Invalid JSON:\n")
		for _, desc := range result.Errors() {
			fmt.Printf("- %s\n", desc)
		}
		return Result{fmt.Sprintf("Invalid JSON: %s\n", result.Errors()[0]), 1, nil}
	}

	var data Data
	if err := json.Unmarshal(bytes, &data); err != nil {
		return Result{fmt.Sprintf("JSON unmarshaling failed: %s\n", err), 1, nil}
	}

	enrichData(&data)

	errNo, errString := validateData(&data)
	if errNo > 0 {
		return Result{fmt.Sprintf(errString), 1, nil}
	}

	ctx := drawScene(&data, i18n)

	w := ctx.Width()
	h := ctx.Height()

	secs := time.Since(start).Seconds()
	return Result{fmt.Sprintf("Image dimensions %d✕%d: %.2fs", w, h, secs), 0, ctx}
}
