package models

type Quiz struct {
	ID          int        `json:"id" required:"true" description:"Unique identifier of the quiz."`
	UUID        string     `json:"uuid" required:"true" description:"UUID"`
	Title       string     `json:"title" required:"true" description:"Title of the quiz."`
	Description string     `json:"description" description:"Description of the quiz."`
	IsPublished bool       `json:"isPublished" description:"Publication status of the quiz."`
	PlayCount   int        `json:"playCount" description:"Number of times the quiz has been played."`
	Questions   []Question `json:"questions" description:"List of questions in the quiz."`
}

// type Quiz struct {
// 	ID          int    `gorm:"primaryKey;autoIncrement"`
// 	UUID        string `gorm:"type:uuid;default:gen_random_uuid();not null;uniqueIndex"`
// 	Title       string `gorm:"type:text;not null"`
// 	Description string `gorm:"type:text"`
// 	IsPublished *bool  `gorm:"type:boolean"`
// 	PlayCount   int    `gorm:"type:integer;not null;default:0"`
// 	Questions   []Question
// }
