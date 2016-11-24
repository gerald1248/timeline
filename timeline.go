package main

import (
	"flag"
	"fmt"
	"image/color"
	"os"
	"sync"
	"time"
)

type Data struct {
	Title                            string  `json:"title"`
	Zoom                             string  `json:"zoom"`
	End                              string  `json:"end"`
	LayoutSteps                      [2]int  `json:"layoutSteps"`
	Tasks                            []*Task `json:"tasks"`
	ActiveTheme                      *Theme  `json:"theme"`
	First, Last                      time.Time
	Days                             int
	FontSize, Scale                  float64
	W, H, LabelW, ChartW, DayW, RowH float64
	FrameBorderColor                 color.Color
	FrameFillColor                   color.Color
	CanvasColor1                     color.Color
	CanvasColor2                     color.Color
	CanvasGridColor                  color.Color
}

type Task struct {
	Start              string   `json:"start"`
	End                string   `json:"end"`
	Label              string   `json:"label"`
	Recur              string   `json:"recur"`
	Milestones         []string `json:"milestones"`
	DateStamps         []string `json:"dateStamps"`
	StartTo            []int    `json:"startTo"`
	EndTo              []int    `json:"endTo"`
	StartTime, EndTime time.Time
	BorderColor        color.Color
	FillColor          color.Color
}

type Theme struct {
	Name             string   `json:"name"`
	BorderColor1     [3]uint8 `json:"borderColor1"`
	FillColor1       [3]uint8 `json:"fillColor1"`
	BorderColor2     [3]uint8 `json:"borderColor2"`
	FillColor2       [3]uint8 `json:"fillColor2"`
	ConstrastColor   [3]uint8 `json:"contrastColor"`
	FrameBorderColor [3]uint8 `json:"frameBorderColor"`
	FrameFillColor   [3]uint8 `json:"frameFillColor"`
	CanvasColor1     [3]uint8 `json:"canvasColor1"`
	CanvasColor2     [3]uint8 `json:"canvasColor2"`
	CanvasGridColor  [3]uint8 `json:"canvasGridColor"`
}

type Result struct {
	Message string
	Code    int
}

func main() {
	port := flag.Int("p", 8000, "listen on port")
	flag.Parse()

	//TODO: --help switch for usage
	args := flag.Args()

	if len(args) == 0 {
		serve(*port)
		return
	}

	ch := make(chan Result)

	for _, input := range args {
		go processFile(input, ch)
	}

	var mu sync.Mutex
	var code int
	for range args {
		result := <-ch
		mu.Lock()
		code += result.Code
		mu.Unlock()
		fmt.Println(result.Message)
	}
	os.Exit(code)
}

func usage() {
	fmt.Printf("Usage: ./timeline [<JSON file> [<JSON file>]]\n")
	os.Exit(0)
}
