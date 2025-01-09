package handlers

// type QuestionHandler struct {
// 	DB *gorm.DB
// }

// func NewQuestionHandler(db *gorm.DB) *QuestionHandler {
// 	return &QuestionHandler{DB: db}
// }

// func (h *QuestionHandler) GetQuestionByUUID(w http.ResponseWriter, r *http.Request) {
// 	// Extract UUID from URL
// 	vars := mux.Vars(r)
// 	uuid := vars["uuid"]

// 	// Fetch the question from the database
// 	var question models.Question
// 	result := h.DB.Where("uuid = ?", uuid).First(&question)
// 	if result.Error != nil {
// 		if result.Error == gorm.ErrRecordNotFound {
// 			http.Error(w, "Question not found", http.StatusNotFound)
// 			return
// 		}
// 		http.Error(w, "Internal server error", http.StatusInternalServerError)
// 		return
// 	}

// 	// Respond with the question as JSON
// 	w.Header().Set("Content-Type", "application/json")
// 	json.NewEncoder(w).Encode(question)
// }
