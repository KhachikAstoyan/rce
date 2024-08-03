package dtos

type CreateRoleDto struct {
	Name        string `json:"name"`
	Description string `json:"description"`
}

type AssociatePermissionsDto struct {
	Permissions []uint `json:"permissions"`
}
