package handlers

// type AnswerHandler struct {
// 	DB *gorm.DB
// }

// func NewAnswerHandler(db *gorm.DB) *AnswerHandler {
// 	return &AnswerHandler{DB: db}
// }

// func (h *AnswerHandler) GetAnswerByUUID(w http.ResponseWriter, r *http.Request) {
// 	// Extract UUID from URL
// 	vars := mux.Vars(r)
// 	uuid := vars["uuid"]

// 	// Fetch the answer from the database
// 	var answer models.Answer
// 	result := h.DB.Where("uuid = ?", uuid).First(&answer)
// 	if result.Error != nil {
// 		if result.Error == gorm.ErrRecordNotFound {
// 			http.Error(w, "Answer not found", http.StatusNotFound)
// 			return
// 		}
// 		http.Error(w, "Internal server error", http.StatusInternalServerError)
// 		return
// 	}

// 	// Respond with the answer as JSON
// 	w.Header().Set("Content-Type", "application/json")
// 	json.NewEncoder(w).Encode(answer)
// }
