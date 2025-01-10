package models

type Pagination struct {
	Page int `json:"page" required:"true"`
	Size int `json:"size" required:"true"`
}

type Meta struct {
	Page       int `json:"page" required:"true"`
	Size       int `json:"size" required:"true"`
	TotalPages int `json:"totalPages" required:"true"`
	TotalItems int `json:"totalItems" required:"true"`
}
