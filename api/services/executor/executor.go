package executor

import (
	"github.com/KhachikAstoyan/toy-rce-api/models"
	"github.com/KhachikAstoyan/toy-rce-api/queue"
	"github.com/KhachikAstoyan/toy-rce-api/utils"
)

const DEV_EXECUTOR_JS string = "http://localhost:8000"

type TestSubmissionPayload struct {
	SubmissionID string `json:"submissionId" validate:"required"`
	Language     string `json:"language" validate:"required"`
	Solution     string `json:"solution" validate:"required"`
	Tests        string `json:"testCode" validate:"required"`
}

func TestSubmissionDev(submission *models.Submission, test *models.Test) error {
	payload := TestSubmissionPayload{
		SubmissionID: submission.ID,
		Language:     submission.Language,
		Solution:     submission.Solution,
		Tests:        test.TestCode,
	}

	err := utils.ValidateStruct(payload)

	if err != nil {
		return err
	}

	err = queue.SendMessage(queue.SubmissionsQueue, payload)

	if err != nil {
		return err
	}

	return nil

	// req, err := http.NewRequest("POST", DEV_EXECUTOR_JS, bytes.NewBuffer(jsonPayload))

	// if err != nil {
	// 	return nil, err
	// }

	// req.Header.Set("Content-Type", "application/json")

	// client := &http.Client{}
	// resp, err := client.Do(req)

	// if err != nil {
	// 	return nil, err
	// }

	// defer resp.Body.Close()

	// return resp, nil
}
