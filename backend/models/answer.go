package models

type Answer struct {
	ID        string `json:"id" required:"true" description:"Unique identifier of the answer."`
	Text      string `json:"text" required:"true" description:"Text of the answer."`
	IsCorrect bool   `json:"isCorrect" description:"Indicates if the answer is correct."`
}

// type Answer struct {
// 	ID         int      `gorm:"primaryKey;autoIncrement"`
// 	UUID       string   `gorm:"type:uuid;default:gen_random_uuid();not null;uniqueIndex"`
// 	Title      string   `gorm:"type:text;not null"`
// 	IsCorrect  bool     `gorm:"type:boolean;not null"`
// 	QuestionID int      `gorm:"not null"`
// 	Question   Question `gorm:"foreignKey:QuestionID;constraint:OnDelete:CASCADE"`
// }
