package dtos

import (
	"github.com/KhachikAstoyan/toy-rce-api/types"
)

type CreateSubmissionDto struct {
	Solution  string `json:"solution"`
	Language  string `json:"language"`
	ProblemID string `json:"problemId"`
}

type CreateSubmissionResponse struct {
	ID string `json:"id"`
}

type PendingSubmissionResponse struct {
	Status string `json:"status"`
}

type PostSubmissionResultsDto struct {
	Results *types.SubmissionResult `json:"results"`
}
