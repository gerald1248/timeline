package main

import (
	"fmt"
	"image/color"
	"strconv"
)

func enrichData(d *Data) {
	//custom end date
	if d.End != "" {
		d.Last = calcLast(d.End)
	}

	//convert datestamps first
	for _, task := range d.Tasks {
		processTask(d, task)
	}

	setDefaults(d)
	applyTheme(d)

	d.Days = (d.Last.Year()*365 + d.Last.YearDay()) - (d.First.Year()*365 + d.First.YearDay())

	// safe layout defaults
	// show days if < 90 days; show months if < 180 days
	if d.LayoutSteps[0] == 0 || d.LayoutSteps[1] == 0 {
		d.LayoutSteps = [2]int{90, 180}
	}

	//zoom property defaults to 100%
	if d.Zoom == 0 {
		d.Zoom = 100
	}

	d.Scale = float64(d.Zoom) / 100
	d.W, d.H, d.RowH, d.FontSize = 1024.0*d.Scale, 768.0*d.Scale, 20.0*d.Scale, 10.0*d.Scale
}

func validateData(d *Data) (int, string) {
	if d.Scale <= 0.0 || d.W <= 0.0 || d.H <= 0.0 || d.RowH <= 0.0 || d.FontSize <= 0.0 {
		s := fmt.Sprintf("Parameter unitialized or invalid: Scale, W, H, RowH, FontSize = %.2f, %.2f, %.2f, %.2f, %.2f\n", d.Scale, d.W, d.H, d.RowH, d.FontSize)
		return 1, s
	}

	if d.Days <= 0 {
		s := fmt.Sprintf("Invalid number of days: %d\n", d.Days)
		return 1, s
	}

	length := len(d.Tasks)
	if length == 0 {
		s := fmt.Sprint("No tasks specified\n")
		return 1, s
	}

	for index, task := range d.Tasks {
		if task.StartTime.Unix() > task.EndTime.Unix() {
			s := fmt.Sprintf("Task #%d ends before it begins: %s\n", index+1, task)
			return 1, s
		}

		//blank labels are allowed
		if task.StartTime.IsZero() || task.EndTime.IsZero() {
			s := fmt.Sprintf("Task #%d is incomplete: %s", index+1, task)
			return 1, s
		}

		//start exp
		if len(task.StartTo) > 0 || len(task.EndTo) > 0 {
			a := task.StartTo
			a = append(a, task.EndTo...)
			for _, value := range a {
				if index+value >= length {
					s := fmt.Sprintf("Task #%d refers to a non-existent task: %s", index+1, task)
					return 1, s
				}
			}
		}
		//end exp
	}
	return 0, ""
}

func setDefaults(d *Data) {
	d.FrameBorderColor = color.RGBA{0x99, 0x99, 0x99, 0xff}
	d.FrameFillColor = color.RGBA{0xff, 0xff, 0xff, 0xff}
	d.StripeColorDark = color.RGBA{0xdd, 0xdd, 0xdd, 0xff}
	d.StripeColorLight = color.RGBA{0xee, 0xee, 0xee, 0xff}
	d.GridColor = color.RGBA{0x99, 0x99, 0x99, 0xff}
}

func processTask(d *Data, t *Task) {
	t.StartTime = parseDateStamp(t.Start)

	//end time may be placeholder; if so, use currently known last date
	if t.End == "-" {
		t.EndTime = d.Last
	} else {
		t.EndTime = parseDateStamp(t.End)
	}

	if d.First.IsZero() || t.StartTime.Unix() < d.First.Unix() {
		d.First = t.StartTime
	}

	if d.Last.IsZero() || t.EndTime.Unix() > d.Last.Unix() {
		d.Last = t.EndTime
	}

	t.BorderColor = color.RGBA{0x55, 0x55, 0x55, 0xff}
	t.FillColor = color.RGBA{0xff, 0xff, 0xff, 0xff}
}
