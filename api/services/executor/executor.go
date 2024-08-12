package executor

import (
	"fmt"

	"github.com/KhachikAstoyan/toy-rce-api/models"
	"github.com/KhachikAstoyan/toy-rce-api/queue"
	"github.com/KhachikAstoyan/toy-rce-api/types"
	"github.com/KhachikAstoyan/toy-rce-api/utils"
)

const DEV_EXECUTOR_JS string = "http://localhost:8000"

type TestSubmissionPayload struct {
	SubmissionID string           `json:"submissionId" validate:"required"`
	Language     string           `json:"language" validate:"required"`
	Solution     string           `json:"solution" validate:"required"`
	Tests        *types.TestSuite `json:"tests" validate:"required"`
	Skeleton     string           `json:"skeleton" validate:"required"`
}

func TestSubmissionDev(submission *models.Submission, test *models.Test) error {
	test.TestSuite.ProblemId = submission.ProblemID
	payload := TestSubmissionPayload{
		SubmissionID: submission.ID,
		Language:     submission.Language,
		Solution:     submission.Solution,
		Tests:        test.TestSuite,
		Skeleton:     test.Skeleton,
	}

	err := utils.ValidateStruct(payload)

	if err != nil {
		fmt.Println("HERE")
		fmt.Println(err.Error())
		return err
	}

	err = queue.SendMessage(queue.SubmissionsQueue, payload)
	fmt.Println("Sent to queue")

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
