package handlers

import "testing"

func TestIsValidClientRedirectURI(t *testing.T) {
	tests := []struct {
		uri  string
		want bool
	}{
		// Loopback (native apps / CLI MCP clients)
		{"http://localhost:33418", true},
		{"http://localhost:8080/callback", true},
		{"http://127.0.0.1:33418/", true},
		{"http://127.0.0.1/callback?foo=bar", true},
		{"http://[::1]:5000/callback", true},
		// Explicit allowlist
		{"https://vscode.dev/redirect", true},
		{"https://insiders.vscode.dev/redirect", true},
		// Rejected
		{"", false},
		{"https://evil.example/callback", false},
		{"http://evil.example/callback", false},
		{"http://localhost.evil.example/callback", false},
		{"http://127.0.0.1.evil.example/callback", false},
		{"http://user@localhost:8080/callback", false},
		{"https://localhost:8080/callback", false},
		{"https://vscode.dev/redirect/../evil", false},
		{"https://vscode.dev.evil.example/redirect", false},
		{"javascript:alert(1)", false},
		{"//evil.example", false},
	}

	for _, tt := range tests {
		if got := IsValidClientRedirectURI("", tt.uri); got != tt.want {
			t.Errorf("IsValidClientRedirectURI(%q) = %v, want %v", tt.uri, got, tt.want)
		}
	}
}
