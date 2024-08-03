package types

import (
	"database/sql/driver"
	"encoding/json"
	"errors"
)

type SubmissionResult struct {
	Success     bool         `json:"success"`
	Passed      uint32       `json:"passed"`
	Failed      uint32       `json:"failed"`
	TestResults []TestResult `json:"testResults"`
}

type TestResult struct {
	Success          bool              `json:"success"`
	AssertionResults []AssertionResult `json:"assertionResults"`
}

type AssertionResult struct {
	Expected string `json:"expected"`
	Received string `json:"received"`
}

func (sr *SubmissionResult) Scan(value interface{}) error {
	bytes, ok := value.([]byte)

	if !ok {
		return errors.New("type assertion to []byte failed for SubmissionResult")
	}

	return json.Unmarshal(bytes, &sr)
}

func (sr SubmissionResult) Value() (driver.Value, error) {
	return json.Marshal(sr)
}
