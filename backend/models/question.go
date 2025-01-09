package models

// Question represents the `question` table
type Question struct {
	ID          int    `gorm:"primaryKey;autoIncrement"`
	UUID        string `gorm:"type:uuid;default:gen_random_uuid();not null;uniqueIndex"`
	Title       string `gorm:"type:text;not null"`
	Description string `gorm:"type:text"`
	Explanation string `gorm:"type:text"`
	QuizID      int    `gorm:"not null"`
	Quiz        Quiz   `gorm:"foreignKey:QuizID;constraint:OnDelete:CASCADE"`
	Answers     []Answer
}
