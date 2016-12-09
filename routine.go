package main

import (
	"encoding/json"
	"fmt"
	"github.com/llgcode/draw2d"
	"github.com/llgcode/draw2d/draw2dimg"
	"github.com/xeipuuv/gojsonschema"
	"io/ioutil"
	"strings"
	"time"
)

func processFile(inputPath string) ShortResult {
	start := time.Now()

	buffer, err := ioutil.ReadFile(inputPath)
	if err != nil {
		return ShortResult{fmt.Sprintf("can't read input file: %v\n", err), 1}
	}

	result := processBytes(buffer)

	//output filename
	bare := strings.Replace(strings.ToLower(inputPath), ".json", "", -1)
	ext := ".png"
	outputPath := strings.Join([]string{bare, ext}, "")

	//save to file
	draw2dimg.SaveToPngFile(outputPath, result.Image)

	secs := time.Since(start).Seconds()
	return ShortResult{fmt.Sprintf("%s: %.2fs", outputPath, secs), result.Code}
}

func processBytes(bytes []byte) Result {
	start := time.Now()

	//staticTimelineSchemaJsonBytes func taken from bindata.go; if function name doesn't match, go get -u helps
	schemaBytes, err := staticTimelineSchemaJsonBytes()
	if err != nil {
		return Result{fmt.Sprintf("can't retrieve schema file: %v\n", err), 1, nil}
	}

	schemaLoader := gojsonschema.NewStringLoader(string(schemaBytes))
	documentLoader := gojsonschema.NewStringLoader(string(bytes))

	result, err := gojsonschema.Validate(schemaLoader, documentLoader)
	if err != nil {
		return Result{fmt.Sprintf("Error: %s\n", err.Error()), 1, nil}
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

	draw2d.SetFontFolder("./resource/font")
	img := drawScene(&data)

	b := img.Bounds()
	w := b.Max.X
	h := b.Max.Y

	secs := time.Since(start).Seconds()
	return Result{fmt.Sprintf("Image dimensions %d✕%d: %.2fs", w, h, secs), 0, img}
}
