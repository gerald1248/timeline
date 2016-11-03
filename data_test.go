package main

import "testing"

func TestValidateData(t *testing.T) {
	var unitializedTestData Data

	errNo, _ := validateData(&unitializedTestData)
	if errNo == 0 {
		t.Error("Uninitalized data accepted")
	}
}
