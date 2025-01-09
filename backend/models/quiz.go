package models

// Quiz represents the `quiz` table
type Quiz struct {
	ID          int    `gorm:"primaryKey;autoIncrement"`
	UUID        string `gorm:"type:uuid;default:gen_random_uuid();not null;uniqueIndex"`
	Title       string `gorm:"type:text;not null"`
	Description string `gorm:"type:text"`
	IsPublished *bool  `gorm:"type:boolean"`
	PlayCount   int    `gorm:"type:integer;not null;default:0"`
	Questions   []Question
}
