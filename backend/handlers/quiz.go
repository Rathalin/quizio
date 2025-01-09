package handlers

// type QuizHandler struct {
// 	DB *gorm.DB
// }

// func NewQuizHandler(db *gorm.DB) *QuizHandler {
// 	return &QuizHandler{DB: db}
// }

// GetAllQuizzes godoc
// @Summary Get all quizzes
// @Description Get all quizzes from the database
// @Tags quizzes
// @Produce json
// @Success 200 {array} models.Quiz
// @Router /quizzes [get]
// func (h *QuizHandler) GetAllQuizzes(w http.ResponseWriter, r *http.Request) {
// 	var quizzes []models.Quiz
// 	result := h.DB.Find(&quizzes)
// 	if result.Error != nil {
// 		http.Error(w, "Internal server error", http.StatusInternalServerError)
// 		return
// 	}

// 	w.Header().Set("Content-Type", "application/json")
// 	json.NewEncoder(w).Encode(quizzes)
// }

// func (h *QuizHandler) GetQuizByUUID(w http.ResponseWriter, r *http.Request) {
// 	// Extract UUID from URL
// 	vars := mux.Vars(r)
// 	uuid := vars["uuid"]

// 	// Fetch the quiz from the database
// 	var quiz models.Quiz
// 	result := h.DB.Where("uuid = ?", uuid).First(&quiz)
// 	if result.Error != nil {
// 		if result.Error == gorm.ErrRecordNotFound {
// 			http.Error(w, "Quiz not found", http.StatusNotFound)
// 			return
// 		}
// 		http.Error(w, "Internal server error", http.StatusInternalServerError)
// 		return
// 	}

// 	// Respond with the quiz as JSON
// 	w.Header().Set("Content-Type", "application/json")
// 	json.NewEncoder(w).Encode(quiz)
// }
