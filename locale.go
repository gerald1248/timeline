package main

import "fmt"
import "encoding/json"

//i18n
func getI18n() ([]*Locale, string) {
	i18nBytes, err := staticI18nJsonBytes()
	var i18n []*Locale
	if err != nil {
		s := fmt.Sprintf("can't retrieve i18n file: %v\n", err)
		return i18n, s
	}
	err = json.Unmarshal(i18nBytes, &i18n)
	if err != nil {
		s := fmt.Sprintf("can't parse i18n file: %v\n", err)
		return i18n, s
	}
	return i18n, ""
}

func getLocaleIndex(lang string, i18n []*Locale) int {
	for i, obj := range i18n {
		if lang == obj.Lang {
			return i
		}
	}
	return 0 //if in doubt, default to en-us
}
