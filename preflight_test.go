package main

import (
	"testing"
)

func TestPreflightAsset(t *testing.T) {
	jsonFileMock := "mock.json"
	yamlFileMock := "mock.yaml"

	//byte slices
	invalidUtf8 := []byte{0xff, 0xfe, 0xfd}
	xmlMarkup := []byte("<?xml version='1.0' encoding='UTF-8' standalone='yes'?><root/>")
	validJson := []byte("{ \"foo\": [\"bar\", \"barfoo\"] }")
	validYaml := []byte("\"foo\": \"bar\"")
	multilineYaml := []byte(`"foo":
- "bar"
- "foobar"
- "boofar"
- "roobar"
`)
	multilineYamlConverted := []byte("{\"foo\":[\"bar\",\"foobar\",\"boofar\",\"roobar\"]}")
	//expect error
	err := preflightAsset(&invalidUtf8, jsonFileMock)
	if err == nil {
		t.Error("Must reject invalid UTF8 with JSON filename")
	}

	err = preflightAsset(&invalidUtf8, yamlFileMock)
	if err == nil {
		t.Error("Must reject invalid UTF8 with YAML filename")
	}

	err = preflightAsset(&validYaml, jsonFileMock)
	if err == nil {
		t.Error("Must reject YAML with JSON filename")
	}

	//much JSON is also valid YAML, so don't disallow JSON with YAML filename

	err = preflightAsset(&xmlMarkup, "")
	if err == nil {
		t.Error("Must reject XML markup")
	}

	//expect success
	err = preflightAsset(&validYaml, yamlFileMock)
	if err != nil {
		t.Errorf("Must accept valid YAML: %v", err)
	}

	err = preflightAsset(&validJson, jsonFileMock)
	if err != nil {
		t.Errorf("Must accept valid JSON: %v", err)
	}

	//in-place conversion must match predefined result
	err = preflightAsset(&multilineYaml, yamlFileMock)
	if err != nil {
		t.Errorf("Must accept valid multiline YAML: %v", err)
	}
	if string(multilineYaml) != string(multilineYamlConverted) {
		t.Errorf("Expected %s to match %s", multilineYaml, multilineYamlConverted)
	}
}
