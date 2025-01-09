package models

type Question struct {
	ID      string   `json:"id" required:"true" description:"Unique identifier of the question."`
	Text    string   `json:"text" required:"true" description:"Text of the question."`
	Answers []Answer `json:"answers" description:"List of answers for the question."`
}

// type Question struct {
// 	ID          int    `gorm:"primaryKey;autoIncrement"`
// 	UUID        string `gorm:"type:uuid;default:gen_random_uuid();not null;uniqueIndex"`
// 	Title       string `gorm:"type:text;not null"`
// 	Description string `gorm:"type:text"`
// 	Explanation string `gorm:"type:text"`
// 	QuizID      int    `gorm:"not null"`
// 	Quiz        Quiz   `gorm:"foreignKey:QuizID;constraint:OnDelete:CASCADE"`
// 	Answers     []Answer
// }
