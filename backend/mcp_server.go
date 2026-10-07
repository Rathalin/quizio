package main

import (
	"bytes"
	"context"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"os"
	"sync"

	"github.com/mark3labs/mcp-go/mcp"
	mcpserver "github.com/mark3labs/mcp-go/server"
)

var sessionTokens sync.Map

func doRequest(method, path string, body interface{}, authToken string) ([]byte, error) {
	apiURL := os.Getenv("QUIZIO_API_URL")
	if apiURL == "" {
		apiURL = "http://localhost:8080"
	}

	var bodyReader io.Reader
	if body != nil {
		b, err := json.Marshal(body)
		if err != nil {
			return nil, err
		}
		bodyReader = bytes.NewReader(b)
	}

	req, err := http.NewRequest(method, apiURL+path, bodyReader)
	if err != nil {
		return nil, err
	}
	req.Header.Set("Content-Type", "application/json")
	if authToken != "" {
		req.Header.Set("Authorization", "Bearer "+authToken)
	}

	client := &http.Client{}
	resp, err := client.Do(req)
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()

	respBody, err := io.ReadAll(resp.Body)
	if err != nil {
		return nil, err
	}

	if resp.StatusCode >= 400 {
		return nil, fmt.Errorf("API error %d: %s", resp.StatusCode, string(respBody))
	}

	return respBody, nil
}

func getToken(ctx context.Context) (string, error) {
	session := mcpserver.ClientSessionFromContext(ctx)
	if session == nil {
		return "", fmt.Errorf("no active MCP session")
	}
	tokenRaw, ok := sessionTokens.Load(session.SessionID())
	if !ok {
		return "", fmt.Errorf("not signed in. Please use the sign_in tool first")
	}
	return tokenRaw.(string), nil
}

func setupMCPServer() *mcpserver.StreamableHTTPServer {
	s := mcpserver.NewMCPServer("quizio-mcp", "1.0.0")

	// 0. sign_in
	s.AddTool(mcp.NewTool("sign_in", mcp.WithDescription("Sign in to Quizio to obtain an authentication session token"),
		mcp.WithString("username", mcp.Required()),
		mcp.WithString("password", mcp.Required()),
	), func(ctx context.Context, request mcp.CallToolRequest) (*mcp.CallToolResult, error) {
		args, ok := request.Params.Arguments.(map[string]interface{})
		if !ok {
			return mcp.NewToolResultError("invalid arguments format"), nil
		}
		username, _ := args["username"].(string)
		password, _ := args["password"].(string)

		body := map[string]string{
			"username": username,
			"password": password,
		}
		resp, err := doRequest(http.MethodPost, "/sign-in", body, "")
		if err != nil {
			return mcp.NewToolResultError(err.Error()), nil
		}

		var result struct {
			AccessToken string `json:"accessToken"`
		}
		if err := json.Unmarshal(resp, &result); err != nil {
			return mcp.NewToolResultError("Failed to parse sign-in response"), nil
		}

		session := mcpserver.ClientSessionFromContext(ctx)
		if session == nil {
			return mcp.NewToolResultError("Failed to get MCP session from context"), nil
		}
		sessionTokens.Store(session.SessionID(), result.AccessToken)
		return mcp.NewToolResultText("Successfully signed in! You can now use the other MCP tools to interact with quizzes."), nil
	})

	// 1. get_quizzes
	s.AddTool(mcp.NewTool("get_quizzes", mcp.WithDescription("Get all quizzes for the authorized user")),
		func(ctx context.Context, request mcp.CallToolRequest) (*mcp.CallToolResult, error) {
			token, err := getToken(ctx)
			if err != nil {
				return mcp.NewToolResultError(err.Error()), nil
			}
			resp, err := doRequest(http.MethodGet, "/me/quizzes", nil, token)
			if err != nil {
				return mcp.NewToolResultError(err.Error()), nil
			}
			return mcp.NewToolResultText(string(resp)), nil
		},
	)

	// 2. get_quiz
	s.AddTool(mcp.NewTool("get_quiz",
		mcp.WithDescription("Get a specific quiz by UUID"),
		mcp.WithString("uuid", mcp.Required(), mcp.Description("Quiz UUID")),
	), func(ctx context.Context, request mcp.CallToolRequest) (*mcp.CallToolResult, error) {
		token, err := getToken(ctx)
		if err != nil {
			return mcp.NewToolResultError(err.Error()), nil
		}
		args, ok := request.Params.Arguments.(map[string]interface{})
		if !ok {
			return mcp.NewToolResultError("invalid arguments format"), nil
		}
		uuid, ok := args["uuid"].(string)
		if !ok {
			return mcp.NewToolResultError("uuid is required and must be a string"), nil
		}
		resp, err := doRequest(http.MethodGet, "/me/quizzes/"+uuid, nil, token)
		if err != nil {
			return mcp.NewToolResultError(err.Error()), nil
		}
		return mcp.NewToolResultText(string(resp)), nil
	})

	// 3. delete_quiz
	s.AddTool(mcp.NewTool("delete_quiz",
		mcp.WithDescription("Delete a quiz by UUID"),
		mcp.WithString("uuid", mcp.Required(), mcp.Description("Quiz UUID")),
	), func(ctx context.Context, request mcp.CallToolRequest) (*mcp.CallToolResult, error) {
		token, err := getToken(ctx)
		if err != nil {
			return mcp.NewToolResultError(err.Error()), nil
		}
		args, ok := request.Params.Arguments.(map[string]interface{})
		if !ok {
			return mcp.NewToolResultError("invalid arguments format"), nil
		}
		uuid, ok := args["uuid"].(string)
		if !ok {
			return mcp.NewToolResultError("uuid is required and must be a string"), nil
		}
		resp, err := doRequest(http.MethodDelete, "/me/quizzes/"+uuid, nil, token)
		if err != nil {
			return mcp.NewToolResultError(err.Error()), nil
		}
		return mcp.NewToolResultText(fmt.Sprintf("Quiz %s deleted successfully. Response: %s", uuid, string(resp))), nil
	})

	// 4. create_quiz
	createQuizTool := mcp.Tool{
		Name:        "create_quiz",
		Description: "Create a new quiz",
		InputSchema: mcp.ToolInputSchema{
			Type: "object",
			Properties: map[string]interface{}{
				"title":       map[string]interface{}{"type": "string"},
				"description": map[string]interface{}{"type": "string"},
				"isPublished": map[string]interface{}{"type": "boolean"},
				"imageUrl":    map[string]interface{}{"type": "string"},
				"questions": map[string]interface{}{
					"type": "array",
					"items": map[string]interface{}{
						"type": "object",
						"properties": map[string]interface{}{
							"title":               map[string]interface{}{"type": "string"},
							"description":         map[string]interface{}{"type": "string"},
							"imageUrl":            map[string]interface{}{"type": "string"},
							"explanation":         map[string]interface{}{"type": "string"},
							"explanationImageUrl": map[string]interface{}{"type": "string"},
							"answers": map[string]interface{}{
								"type": "array",
								"items": map[string]interface{}{
									"type": "object",
									"properties": map[string]interface{}{
										"title":       map[string]interface{}{"type": "string"},
										"description": map[string]interface{}{"type": "string"},
										"imageUrl":    map[string]interface{}{"type": "string"},
										"isCorrect":   map[string]interface{}{"type": "boolean"},
									},
									"required": []string{"title", "isCorrect"},
								},
							},
						},
						"required": []string{"title", "answers"},
					},
				},
			},
			Required: []string{"title", "isPublished", "questions"},
		},
	}
	s.AddTool(createQuizTool, func(ctx context.Context, request mcp.CallToolRequest) (*mcp.CallToolResult, error) {
		token, err := getToken(ctx)
		if err != nil {
			return mcp.NewToolResultError(err.Error()), nil
		}
		resp, err := doRequest(http.MethodPost, "/me/quizzes/create", request.Params.Arguments, token)
		if err != nil {
			return mcp.NewToolResultError(err.Error()), nil
		}
		return mcp.NewToolResultText(fmt.Sprintf("Quiz created successfully:\n%s", string(resp))), nil
	})

	// 5. update_quiz
	updateQuizTool := mcp.Tool{
		Name:        "update_quiz",
		Description: "Update an existing quiz",
		InputSchema: mcp.ToolInputSchema{
			Type: "object",
			Properties: map[string]interface{}{
				"uuid":        map[string]interface{}{"type": "string"},
				"title":       map[string]interface{}{"type": "string"},
				"description": map[string]interface{}{"type": "string"},
				"isPublished": map[string]interface{}{"type": "boolean"},
				"imageUrl":    map[string]interface{}{"type": "string"},
				"questions": map[string]interface{}{
					"type": "array",
					"items": map[string]interface{}{
						"type": "object",
						"properties": map[string]interface{}{
							"uuid":                map[string]interface{}{"type": "string"},
							"title":               map[string]interface{}{"type": "string"},
							"description":         map[string]interface{}{"type": "string"},
							"imageUrl":            map[string]interface{}{"type": "string"},
							"explanation":         map[string]interface{}{"type": "string"},
							"explanationImageUrl": map[string]interface{}{"type": "string"},
							"answers": map[string]interface{}{
								"type": "array",
								"items": map[string]interface{}{
									"type": "object",
									"properties": map[string]interface{}{
										"uuid":        map[string]interface{}{"type": "string"},
										"title":       map[string]interface{}{"type": "string"},
										"description": map[string]interface{}{"type": "string"},
										"imageUrl":    map[string]interface{}{"type": "string"},
										"isCorrect":   map[string]interface{}{"type": "boolean"},
									},
									"required": []string{"title", "isCorrect"},
								},
							},
						},
						"required": []string{"title", "answers"},
					},
				},
			},
			Required: []string{"uuid", "title", "isPublished", "questions"},
		},
	}
	s.AddTool(updateQuizTool, func(ctx context.Context, request mcp.CallToolRequest) (*mcp.CallToolResult, error) {
		token, err := getToken(ctx)
		if err != nil {
			return mcp.NewToolResultError(err.Error()), nil
		}
		args, ok := request.Params.Arguments.(map[string]interface{})
		if !ok {
			return mcp.NewToolResultError("invalid arguments format"), nil
		}
		uuid, ok := args["uuid"].(string)
		if !ok {
			return mcp.NewToolResultError("uuid is required and must be a string"), nil
		}
		resp, err := doRequest(http.MethodPost, "/me/quizzes/"+uuid, request.Params.Arguments, token)
		if err != nil {
			return mcp.NewToolResultError(err.Error()), nil
		}
		return mcp.NewToolResultText(fmt.Sprintf("Quiz updated successfully:\n%s", string(resp))), nil
	})

	apiURL := os.Getenv("QUIZIO_API_URL")
	if apiURL == "" {
		apiURL = "http://localhost:8080"
	}

	return mcpserver.NewStreamableHTTPServer(s, mcpserver.WithEndpointPath("/mcp"))
}
