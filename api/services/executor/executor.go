package executor

import (
	"bytes"
	"encoding/json"
	"net/http"

	"github.com/KhachikAstoyan/toy-rce-api/models"
)

const DEV_EXECUTOR_JS string = "http://localhost:8000"

type TestSubmissionAttributes struct {
	SubmissionID string `json:"submissionId"`
	Language     string `json:"language"`
	Solution     string `json:"solution"`
	TestCode     string `json:"testCode"`
}

type TestSubmissionPayload struct {
	Attributes TestSubmissionAttributes `json:"attributes"`
}

func TestSubmissionDev(submission *models.Submission, test *models.Test) (*http.Response, error) {
	payload := TestSubmissionPayload{
		Attributes: TestSubmissionAttributes{
			SubmissionID: submission.ID,
			Language:     submission.Language,
			Solution:     submission.Solution,
			TestCode:     test.TestCode,
		},
	}

	jsonPayload, err := json.Marshal(payload)

	if err != nil {
		return nil, err
	}

	req, err := http.NewRequest("POST", DEV_EXECUTOR_JS, bytes.NewBuffer(jsonPayload))

	if err != nil {
		return nil, err
	}

	req.Header.Set("Content-Type", "application/json")

	client := &http.Client{}
	resp, err := client.Do(req)

	if err != nil {
		return nil, err
	}

	defer resp.Body.Close()

	return resp, nil
}
