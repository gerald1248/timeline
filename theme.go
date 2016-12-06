package main

import (
	"image/color"
	"math"
	"strconv"
)

func r(hex string) uint8 {
	i, _ := strconv.ParseInt("0x" + hex[1:3], 0, 64);
	return uint8(i)
}

func g(hex string) uint8 {
	i, _ := strconv.ParseInt("0x" + hex[3:5], 0, 64);
	return uint8(i)
}

func b(hex string) uint8 {
	i, _ := strconv.ParseInt("0x" + hex[5:], 0, 64);
	return uint8(i)
}

func hexToColor(hex string) color.Color {
	//schema tests against regex
	if len(hex) < 7 {
		return color.RGBA{255, 255, 255, 255}
	}

	return color.RGBA{r(hex), g(hex), b(hex), 255}
} 

func applyTheme(d *Data) {
	if d.MyTheme == nil {
		return
	}

	theme := d.MyTheme
	colorScheme := theme.ColorScheme
	borderColor1 := hexToColor(theme.BorderColor1)
	fillColor1 := hexToColor(theme.FillColor1)
	borderColor2 := hexToColor(theme.BorderColor2)
	fillColor2 := hexToColor(theme.FillColor2)

	switch colorScheme {
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
	d.FrameBorderColor = hexToColor(theme.FrameBorderColor)
	d.FrameFillColor = hexToColor(theme.FrameFillColor)
	d.StripeColorDark = hexToColor(theme.StripeColorDark)
	d.StripeColorLight = hexToColor(theme.StripeColorLight)
	d.GridColor = hexToColor(theme.GridColor)
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

	borderColors = calcGradient(d, borderColor1, borderColor2, 256)
	fillColors = calcGradient(d, fillColor1, fillColor2, 256)

	for index, task := range d.Tasks {
		duration := durations[index]
		
		if (maxDuration == 0) {
			continue
		}

		colorIndex := int64(255) * duration / maxDuration
		
		if colorIndex < 0 {
			continue
		}
		
		task.BorderColor = borderColors[colorIndex]
		task.FillColor = fillColors[colorIndex]
	}
}

func applyGradient(d *Data, borderColor1, fillColor1, borderColor2, fillColor2 color.Color) {
	var borderColors, fillColors []color.Color

	borderColors = calcGradient(d, borderColor1, borderColor2, 256)
	fillColors = calcGradient(d, fillColor1, fillColor2, 256)

	length := len(d.Tasks)
	for index, task := range d.Tasks {
		colorIndex := 255 * index / length
		task.BorderColor = borderColors[colorIndex]
		task.FillColor = fillColors[colorIndex]
	}
}

func calcGradient(d *Data, color1, color2 color.Color, length int) []color.Color {
	green := color.RGBA{0, 255, 0, 255}
	red := color.RGBA{255, 0, 0, 255}
	if color1 == green && color2 == red {
		return calcGradientRAG(d, length)
	}

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

func calcGradientRAG(d *Data, length int) []color.Color {
	gradient := calcGradient(d, color.RGBA{0, 255, 0, 255}, color.RGBA{255, 255, 0, 255}, length/2)
	gradient2 := calcGradient(d, color.RGBA{255, 255, 0, 255}, color.RGBA{255, 0, 0, 255}, length/2)
	gradient = append(gradient, gradient2...)
	return gradient
}

func calcStep(v1, v2, length int) int {
	v := v2 - v1
	if v == 0 {
		return 0
	}

	if length == 0 {
		return v
	}

	return v / length
}
