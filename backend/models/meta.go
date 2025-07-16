package models

type Meta struct {
	Page       int `json:"page" required:"true"`
	PageSize   int `json:"pageSize" required:"true"`
	TotalPages int `json:"totalPages" required:"true"`
	TotalItems int `json:"totalItems" required:"true"`
}
