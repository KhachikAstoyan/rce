package dtos

type CreateSolutionTemplateDTO struct {
	Template  string `json:"template" validate:"required"`
	Language  string `json:"language" validate:"required"`
	ProblemId string `json:"problemId" validate:"required"`
}

type UpdateSolutionTemplateDTO struct {
	Template  string `json:"template" validate:"required"`
}
