package main

import "testing"

func TestParseDateStamp(t *testing.T) {
	testValid := parseDateStamp("2016-01-01")
	testInvalid := parseDateStamp("01-01-2016")

	if testValid.Year() != 2016 || testValid.Month() != 1 || testValid.Day() != 1 {
		t.Error("Valid input produces incorrect time.Time")
	}

	if !testInvalid.IsZero() {
		t.Error("Invalid input produces non-zero time.Time")
	}
}
