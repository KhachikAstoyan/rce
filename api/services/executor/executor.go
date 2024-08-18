package executor

import (
	"github.com/KhachikAstoyan/toy-rce-api/models"
	"github.com/KhachikAstoyan/toy-rce-api/queue"
	"github.com/KhachikAstoyan/toy-rce-api/types"
	"github.com/KhachikAstoyan/toy-rce-api/utils"
)

type TestSubmissionPayload struct {
	SubmissionID string           `json:"submissionId" validate:"required"`
	Language     string           `json:"language" validate:"required"`
	Solution     string           `json:"solution" validate:"required"`
	Tests        *types.TestSuite `json:"tests" validate:"required"`
	Skeleton     string           `json:"skeleton" validate:"required"`
}

func TestSubmission(submission *models.Submission, test *models.Test, skeleton *models.Skeleton) error {
	test.TestSuite.ProblemId = submission.ProblemID
	payload := TestSubmissionPayload{
		SubmissionID: submission.ID,
		Language:     submission.Language,
		Solution:     submission.Solution,
		Tests:        test.TestSuite,
		Skeleton:     skeleton.Skeleton,
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
}
