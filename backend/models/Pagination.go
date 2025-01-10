package models

type Pagination struct {
	Page int `json:"page" required:"true"`
	Size int `json:"size" required:"true"`
}
