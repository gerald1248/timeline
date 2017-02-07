package main

import (
	"encoding/json"
	"errors"
	"fmt"
	"github.com/ghodss/yaml"
	"regexp"
	"unicode/utf8"
)

// ensure YAML as well as JSON can be read
// applies only to file-based processing; the server only accepts JSON
func preflightAsset(a *[]byte, file string) error {
	if len(*a) == 0 {
		return errors.New("input must not be empty")
	}

	if utf8.Valid(*a) == false {
		return errors.New("input must be valid UTF-8")
	}

	//if extension indicates YAML, attempt conversion
	//(otherwise assume JSON)
	re := regexp.MustCompile("(?i)\\.ya?ml$")
	isYaml := re.FindStringIndex(file) != nil

	if isYaml {
		json, err := yaml.YAMLToJSON(*a)
		if err != nil {
			return errors.New(fmt.Sprintf("invalid YAML: %v", err))
		}
		*a = json
	}

	//now parse the JSON
	var any interface{}
	err := json.Unmarshal(*a, &any)
	if err != nil {
		return errors.New(fmt.Sprintf("invalid JSON: %v", err))
	}

	return nil
}
