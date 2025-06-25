package middlewares

import "net/http"

func APIKeyMiddleware(expectedApiKey string) func(http.Handler) http.Handler {
	return func(next http.Handler) http.Handler {
		return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			authHeader := r.Header.Get("Authorization")

			const prefix = "Bearer "
			if len(authHeader) <= len(prefix) || authHeader[:len(prefix)] != prefix {
				http.Error(w, "Missing or invalid API key", http.StatusUnauthorized)
				return
			}

			apiKey := authHeader[len(prefix):]
			if apiKey != expectedApiKey {
				http.Error(w, "Unauthorized", http.StatusUnauthorized)
				return
			}

			next.ServeHTTP(w, r)
		})
	}
}
