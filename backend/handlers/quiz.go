package handlers

import (
	"encoding/json"
	"net/http"

	"quizio/backend/models"

	"github.com/gorilla/mux"
	"gorm.io/gorm"
)

type QuizHandler struct {
	DB *gorm.DB
}

func NewQuizHandler(db *gorm.DB) *QuizHandler {
	return &QuizHandler{DB: db}
}

func (h *QuizHandler) GetQuizByUUID(w http.ResponseWriter, r *http.Request) {
	// Extract UUID from URL
	vars := mux.Vars(r)
	uuid := vars["uuid"]

	// Fetch the quiz from the database
	var quiz models.Quiz
	result := h.DB.Where("uuid = ?", uuid).First(&quiz)
	if result.Error != nil {
		if result.Error == gorm.ErrRecordNotFound {
			http.Error(w, "Quiz not found", http.StatusNotFound)
			return
		}
		http.Error(w, "Internal server error", http.StatusInternalServerError)
		return
	}

	// Respond with the quiz as JSON
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(quiz)
}
