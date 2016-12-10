package main

import (
	"github.com/golang/freetype/truetype"
	"github.com/llgcode/draw2d"
)

type MyFontCache struct {
	fonts map[string]*truetype.Font
}

func (cache *MyFontCache) Load(fontData draw2d.FontData) (font *truetype.Font, err error) {
	switch fontData.Style {
	case draw2d.FontStyleNormal:
		return cache.fonts["regular"], nil
	case draw2d.FontStyleItalic:
		return cache.fonts["italic"], nil
	case draw2d.FontStyleBold:
		return cache.fonts["bold"], nil
	case draw2d.FontStyleBold | draw2d.FontStyleItalic:
		return cache.fonts["bolditalic"], nil
	}
	return
}

func (cache *MyFontCache) Store(fontData draw2d.FontData, font *truetype.Font) {
	switch fontData.Style {
	case draw2d.FontStyleNormal:
		cache.fonts["regular"] = font
		break
	case draw2d.FontStyleItalic:
		cache.fonts["italic"] = font
		break
	case draw2d.FontStyleBold:
		cache.fonts["bold"] = font
		break
	case draw2d.FontStyleBold | draw2d.FontStyleItalic:
		cache.fonts["bolditalic"] = font
		break
	}
}
