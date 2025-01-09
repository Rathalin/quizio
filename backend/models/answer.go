package models

// Answer represents the `answer` table
type Answer struct {
	ID         int      `gorm:"primaryKey;autoIncrement"`
	UUID       string   `gorm:"type:uuid;default:gen_random_uuid();not null;uniqueIndex"`
	Title      string   `gorm:"type:text;not null"`
	IsCorrect  bool     `gorm:"type:boolean;not null"`
	QuestionID int      `gorm:"not null"`
	Question   Question `gorm:"foreignKey:QuestionID;constraint:OnDelete:CASCADE"`
}
