package main

import (
	"image/color"
	"math"
)

func applyTheme(d *Data) {
	if (d.ActiveTheme == nil) {
		return
	}

	theme := d.ActiveTheme
	name := theme.Name
	borderColor1 := color.RGBA{theme.BorderColor1[0], theme.BorderColor1[1], theme.BorderColor1[2], 255}
	fillColor1 := color.RGBA{theme.FillColor1[0], theme.FillColor1[1], theme.FillColor1[2], 255}
	borderColor2 := color.RGBA{theme.BorderColor2[0], theme.BorderColor2[1], theme.BorderColor2[2], 255}
	fillColor2 := color.RGBA{theme.FillColor2[0], theme.FillColor2[1], theme.FillColor2[2], 255}

	switch name {
	case "gradient":
		applyGradient(d, borderColor1, fillColor1, borderColor2, fillColor2)
		break
	case "duration":
		applyDuration(d, borderColor1, fillColor1, borderColor2, fillColor2)
		break
	default:
		break
	}

	//overwrite ActiveTheme settings
	d.FrameBorderColor = color.RGBA{theme.FrameBorderColor[0], theme.FrameBorderColor[1], theme.FrameBorderColor[2], 0xff}
	d.FrameFillColor = color.RGBA{theme.FrameFillColor[0], theme.FrameFillColor[1], theme.FrameFillColor[2], 0xff}
	d.CanvasColor1 = color.RGBA{theme.CanvasColor1[0], theme.CanvasColor1[1], theme.CanvasColor1[2], 0xff}
	d.CanvasColor2 = color.RGBA{theme.CanvasColor2[0], theme.CanvasColor2[1], theme.CanvasColor2[2], 0xff}
	d.CanvasGridColor = color.RGBA{theme.CanvasGridColor[0], theme.CanvasGridColor[1], theme.CanvasGridColor[2], 0xff}
}

func applyDuration(d *Data, borderColor1, fillColor1, borderColor2, fillColor2 color.Color) {
	var borderColors, fillColors []color.Color

	var minDuration, maxDuration int64
	minDuration = int64(math.MaxInt16) //maxDuration is 0

	length := len(d.Tasks)
	durations := make([]int64, length, length)

	//determine durations, min, max
	for index, task := range d.Tasks {
		unixStart := task.StartTime.Unix()
		unixEnd := task.EndTime.Unix()
		duration := unixEnd - unixStart
		durations[index] = duration
		if minDuration > duration {
			minDuration = duration
		} else if maxDuration < duration {
			maxDuration = duration
		}
	}

	points := 255
	borderColors = calcGradient(d, borderColor1, borderColor2, points + 1)
	fillColors = calcGradient(d, fillColor1, fillColor2, points + 1)

	for index, task := range d.Tasks {
		duration := durations[index]
		colorIndex := int64(points) * duration/maxDuration
    if (colorIndex < 0) {
      continue
    }
		task.BorderColor = borderColors[colorIndex]
		task.FillColor = fillColors[colorIndex]
	}
}

func applyGradient(d *Data, borderColor1, fillColor1, borderColor2, fillColor2 color.Color) {
	var borderColors, fillColors []color.Color

	borderColors = calcGradient(d, borderColor1, borderColor2, len(d.Tasks))
	fillColors = calcGradient(d, fillColor1, fillColor2, len(d.Tasks))

	for index, task := range d.Tasks {
		task.BorderColor = borderColors[index]
		task.FillColor = fillColors[index]
	}
}

func calcGradient(d *Data, color1, color2 color.Color, length int) []color.Color {

	colors := make([]color.Color, length, length)
	
	colors[0] = color1
	colors[length-1] = color2

	//assume solid colors
	r1, g1, b1, _ := color1.RGBA()
	r2, g2, b2, _ := color2.RGBA()

	var rStep, gStep, bStep int
	rStep = calcStep(int(r1), int(r2), length)
	gStep = calcStep(int(g1), int(g2), length)
	bStep = calcStep(int(b1), int(b2), length)

	r, g, b := int(r1), int(g1), int(b1)
	for i := 0; i < length; i++ {
		c0 := color.RGBA64{uint16(r), uint16(g), uint16(b), uint16(0xffff)}
		c1 := color.RGBAModel.Convert(c0).(color.RGBA)
		colors[i] = c1

		r += rStep
		g += gStep
		b += bStep
	}

	return colors
}

func calcStep(v1, v2, length int) int {
	v := v2 - v1
	if v == 0 {
		return 0
	}

	if length == 0 {
		return v
	}

	return v/length
}
