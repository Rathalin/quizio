package handlers

func checkNil(value *string) string {
	if value != nil {
		return *value
	}
	return "nil"
}
