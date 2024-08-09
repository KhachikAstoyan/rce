package types

import (
	"database/sql/driver"
	"encoding/json"
	"errors"
)

type TestSuite struct {
	ProblemId string `json:"problemId"`
	Tests     []Test `json:"tests"`
}

type Test struct {
	IsPublic *bool            `json:"isPublic"`
	Inputs   map[string]Value `json:"inputs"`
	Expected Value            `json:"expected"`
}

type Value struct {
	Type  string `json:"type"`
	Value string `json:"value"`
}

func (ts *TestSuite) Scan(value interface{}) error {
	bytes, ok := value.([]byte)

	if !ok {
		return errors.New("type assertion to []byte failed for SubmissionResult")
	}

	return json.Unmarshal(bytes, &ts)
}

func (ts TestSuite) Value() (driver.Value, error) {
	return json.Marshal(ts)
}
