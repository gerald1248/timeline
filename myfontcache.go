package main

import (
	"github.com/golang/freetype/truetype"
	"github.com/llgcode/draw2d"
	"sync"
)

type MyFontCache struct {
	fonts map[string]*truetype.Font
}

func (cache *MyFontCache) Load(fontData draw2d.FontData) (font *truetype.Font, err error) {
	var mu sync.Mutex
	mu.Lock()
	style := "regular"
	switch fontData.Style {
	case draw2d.FontStyleNormal:
	case draw2d.FontStyleItalic:
		style = "italic"
	case draw2d.FontStyleBold:
		style = "bold"
	case draw2d.FontStyleBold | draw2d.FontStyleItalic:
		style = "bolditalic"
	}
	mu.Unlock()
	return cache.fonts[style], nil
}

func (cache *MyFontCache) Store(fontData draw2d.FontData, font *truetype.Font) {
	var mu sync.Mutex
	mu.Lock()
	switch fontData.Style {
	case draw2d.FontStyleNormal:
		cache.fonts["regular"] = font
	case draw2d.FontStyleItalic:
		cache.fonts["italic"] = font
	case draw2d.FontStyleBold:
		cache.fonts["bold"] = font
	case draw2d.FontStyleBold | draw2d.FontStyleItalic:
		cache.fonts["bolditalic"] = font
	}
	mu.Unlock()
}
