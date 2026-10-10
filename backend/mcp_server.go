package main

import (
	"bytes"
	"context"
	"encoding/base64"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"path/filepath"

	"github.com/go-chi/jwtauth/v5"
	"github.com/mark3labs/mcp-go/mcp"
	mcpserver "github.com/mark3labs/mcp-go/server"

	"github.com/Rathalin/quizio/backend/env"
)

type contextKey string

const tokenContextKey contextKey = "jwtToken"

func doRequest(method, path string, body any, authToken string) ([]byte, error) {
	apiURL := env.Config.APIURL

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
	if token, ok := ctx.Value(tokenContextKey).(string); ok && token != "" {
		return token, nil
	}
	return "", fmt.Errorf("not signed in or missing bearer token")
}

func setupMCPServer() *mcpserver.StreamableHTTPServer {
	s := mcpserver.NewMCPServer("quizio-mcp", "1.0.0")

	// 1. get_my_quizzes
	s.AddTool(mcp.NewTool("get_my_quizzes", mcp.WithDescription("Get all quizzes for the authorized user (your private and public quizzes)")),
		func(ctx context.Context, request mcp.CallToolRequest) (*mcp.CallToolResult, error) {
			token, err := getToken(ctx)
			if err != nil {
				return mcp.NewToolResultError(err.Error()), nil
			}
			resp, err := doRequest(http.MethodGet, "/me/quizzes?sortDirection=desc&sortOption=createdAt", nil, token)
			if err != nil {
				return mcp.NewToolResultError(err.Error()), nil
			}
			return mcp.NewToolResultText(string(resp)), nil
		},
	)

	// 1b. get_public_quizzes
	s.AddTool(mcp.NewTool("get_public_quizzes",
		mcp.WithDescription("Get all public quizzes with pagination and sorting"),
		mcp.WithNumber("page", mcp.Required(), mcp.Description("Page number (0-indexed)")),
		mcp.WithNumber("pageSize", mcp.Required(), mcp.Description("Number of items per page")),
		mcp.WithString("sortOption", mcp.Required(), mcp.Description("Field to sort by: 'createdAt' or 'playCount'")),
		mcp.WithString("sortDirection", mcp.Required(), mcp.Description("Sort direction: 'asc' or 'desc'")),
	), func(ctx context.Context, request mcp.CallToolRequest) (*mcp.CallToolResult, error) {
		args, ok := request.Params.Arguments.(map[string]any)
		if !ok {
			return mcp.NewToolResultError("invalid arguments format"), nil
		}

		page, _ := args["page"].(float64)
		pageSize, _ := args["pageSize"].(float64)
		sortOption, _ := args["sortOption"].(string)
		sortDirection, _ := args["sortDirection"].(string)

		path := fmt.Sprintf("/quizzes?page=%d&pageSize=%d&sortOption=%s&sortDirection=%s",
			int(page), int(pageSize), sortOption, sortDirection)

		resp, err := doRequest(http.MethodGet, path, nil, "")
		if err != nil {
			return mcp.NewToolResultError(err.Error()), nil
		}
		return mcp.NewToolResultText(string(resp)), nil
	})

	// 2. get_my_quiz
	s.AddTool(mcp.NewTool("get_my_quiz",
		mcp.WithDescription("Get a specific quiz owned by the authorized user by UUID"),
		mcp.WithString("uuid", mcp.Required(), mcp.Description("Quiz UUID")),
	), func(ctx context.Context, request mcp.CallToolRequest) (*mcp.CallToolResult, error) {
		token, err := getToken(ctx)
		if err != nil {
			return mcp.NewToolResultError(err.Error()), nil
		}
		args, ok := request.Params.Arguments.(map[string]any)
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

	// 3. delete_my_quiz
	s.AddTool(mcp.NewTool("delete_my_quiz",
		mcp.WithDescription("Delete a quiz owned by the authorized user by UUID"),
		mcp.WithString("uuid", mcp.Required(), mcp.Description("Quiz UUID")),
	), func(ctx context.Context, request mcp.CallToolRequest) (*mcp.CallToolResult, error) {
		token, err := getToken(ctx)
		if err != nil {
			return mcp.NewToolResultError(err.Error()), nil
		}
		args, ok := request.Params.Arguments.(map[string]any)
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

	// 4. create_my_quiz
	createQuizTool := mcp.Tool{
		Name:        "create_my_quiz",
		Description: "Create a new quiz for the authorized user",
		InputSchema: mcp.ToolInputSchema{
			Type: "object",
			Properties: map[string]any{
				"title":       map[string]any{"type": "string"},
				"description": map[string]any{"type": "string"},
				"isPublished": map[string]any{"type": "boolean"},
				"imageUrl":    map[string]any{"type": "string"},
				"questions": map[string]any{
					"type": "array",
					"items": map[string]any{
						"type": "object",
						"properties": map[string]any{
							"title":               map[string]any{"type": "string"},
							"description":         map[string]any{"type": "string"},
							"imageUrl":            map[string]any{"type": "string"},
							"explanation":         map[string]any{"type": "string"},
							"explanationImageUrl": map[string]any{"type": "string"},
							"answers": map[string]any{
								"type": "array",
								"items": map[string]any{
									"type": "object",
									"properties": map[string]any{
										"title":       map[string]any{"type": "string"},
										"description": map[string]any{"type": "string"},
										"imageUrl":    map[string]any{"type": "string"},
										"isCorrect":   map[string]any{"type": "boolean"},
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

	// 5. update_my_quiz
	updateQuizTool := mcp.Tool{
		Name:        "update_my_quiz",
		Description: "Update an existing quiz owned by the authorized user",
		InputSchema: mcp.ToolInputSchema{
			Type: "object",
			Properties: map[string]any{
				"uuid":        map[string]any{"type": "string"},
				"title":       map[string]any{"type": "string"},
				"description": map[string]any{"type": "string"},
				"isPublished": map[string]any{"type": "boolean"},
				"imageUrl":    map[string]any{"type": "string"},
				"questions": map[string]any{
					"type": "array",
					"items": map[string]any{
						"type": "object",
						"properties": map[string]any{
							"uuid":                map[string]any{"type": "string"},
							"title":               map[string]any{"type": "string"},
							"description":         map[string]any{"type": "string"},
							"imageUrl":            map[string]any{"type": "string"},
							"explanation":         map[string]any{"type": "string"},
							"explanationImageUrl": map[string]any{"type": "string"},
							"answers": map[string]any{
								"type": "array",
								"items": map[string]any{
									"type": "object",
									"properties": map[string]any{
										"uuid":        map[string]any{"type": "string"},
										"title":       map[string]any{"type": "string"},
										"description": map[string]any{"type": "string"},
										"imageUrl":    map[string]any{"type": "string"},
										"isCorrect":   map[string]any{"type": "boolean"},
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
		args, ok := request.Params.Arguments.(map[string]any)
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

	// 6. upload_file
	// NOTE: The file content must be supplied by the client. Never read paths from the
	// server's filesystem here, as that would allow reading arbitrary server files.
	uploadFileTool := mcp.Tool{
		Name:        "upload_file",
		Description: "Upload a file (e.g. an image for a quiz) to Quizio. Provide the file content base64-encoded. Returns the URL of the uploaded file.",
		InputSchema: mcp.ToolInputSchema{
			Type: "object",
			Properties: map[string]any{
				"filename":      map[string]any{"type": "string", "description": "The name to save the file as (e.g. image.png)"},
				"contentBase64": map[string]any{"type": "string", "description": "The file content, base64-encoded (standard encoding)"},
			},
			Required: []string{"filename", "contentBase64"},
		},
	}
	s.AddTool(uploadFileTool, func(ctx context.Context, request mcp.CallToolRequest) (*mcp.CallToolResult, error) {
		token, err := getToken(ctx)
		if err != nil {
			return mcp.NewToolResultError(err.Error()), nil
		}
		args, ok := request.Params.Arguments.(map[string]any)
		if !ok {
			return mcp.NewToolResultError("invalid arguments format"), nil
		}
		filename, ok := args["filename"].(string)
		if !ok || filename == "" {
			return mcp.NewToolResultError("filename is required and must be a string"), nil
		}
		filename = filepath.Base(filename)
		contentBase64, ok := args["contentBase64"].(string)
		if !ok || contentBase64 == "" {
			return mcp.NewToolResultError("contentBase64 is required and must be a string"), nil
		}

		fileBytes, err := base64.StdEncoding.DecodeString(contentBase64)
		if err != nil {
			return mcp.NewToolResultError(fmt.Sprintf("contentBase64 is not valid base64: %v", err)), nil
		}

		body := map[string]any{
			"filename": filename,
			"file":     fileBytes, // []byte is marshalled as base64, as expected by /me/upload
		}

		resp, err := doRequest(http.MethodPost, "/me/upload", body, token)
		if err != nil {
			return mcp.NewToolResultError(err.Error()), nil
		}
		return mcp.NewToolResultText(fmt.Sprintf("File uploaded successfully:\n%s", string(resp))), nil
	})

	// 7. get_alerts
	s.AddTool(mcp.NewTool("get_alerts",
		mcp.WithDescription("Get system alerts with filtering by visibility"),
		mcp.WithString("visibleTo", mcp.Required(), mcp.Description("Who can see this alert: 'everyone' or 'authorized'")),
	), func(ctx context.Context, request mcp.CallToolRequest) (*mcp.CallToolResult, error) {
		args, ok := request.Params.Arguments.(map[string]any)
		if !ok {
			return mcp.NewToolResultError("invalid arguments format"), nil
		}

		visibleTo, ok := args["visibleTo"].(string)
		if !ok {
			return mcp.NewToolResultError("visibleTo is required and must be a string"), nil
		}

		path := fmt.Sprintf("/alerts?visibleTo=%s", visibleTo)
		resp, err := doRequest(http.MethodGet, path, nil, "")
		if err != nil {
			return mcp.NewToolResultError(err.Error()), nil
		}
		return mcp.NewToolResultText(string(resp)), nil
	})

	// 8. get_my_quiz_trends
	s.AddTool(mcp.NewTool("get_my_quiz_trends",
		mcp.WithDescription("Get play count trends for a specific quiz owned by the authorized user over a time period"),
		mcp.WithString("uuid", mcp.Required(), mcp.Description("Quiz UUID")),
		mcp.WithString("from", mcp.Required(), mcp.Description("Start date in ISO-8601 format (e.g. 2023-01-01T00:00:00Z)")),
		mcp.WithString("to", mcp.Required(), mcp.Description("End date in ISO-8601 format")),
	), func(ctx context.Context, request mcp.CallToolRequest) (*mcp.CallToolResult, error) {
		token, err := getToken(ctx)
		if err != nil {
			return mcp.NewToolResultError(err.Error()), nil
		}
		args, ok := request.Params.Arguments.(map[string]any)
		if !ok {
			return mcp.NewToolResultError("invalid arguments format"), nil
		}

		uuid, _ := args["uuid"].(string)
		from, _ := args["from"].(string)
		to, _ := args["to"].(string)

		if uuid == "" || from == "" || to == "" {
			return mcp.NewToolResultError("uuid, from, and to are required"), nil
		}

		path := fmt.Sprintf("/me/quizzes/%s/trends?from=%s&to=%s", uuid, from, to)
		resp, err := doRequest(http.MethodGet, path, nil, token)
		if err != nil {
			return mcp.NewToolResultError(err.Error()), nil
		}
		return mcp.NewToolResultText(string(resp)), nil
	})

	apiURL := env.Config.APIURL

	return mcpserver.NewStreamableHTTPServer(s,
		mcpserver.WithEndpointPath("/mcp"),
		mcpserver.WithHTTPContextFunc(func(ctx context.Context, r *http.Request) context.Context {
			token := jwtauth.TokenFromHeader(r)
			if token != "" {
				return context.WithValue(ctx, tokenContextKey, token)
			}
			return ctx
		}),
		mcpserver.WithProtectedResourceMetadata(mcpserver.ProtectedResourceMetadataConfig{
			Resource:             apiURL + "/mcp",
			AuthorizationServers: []string{apiURL},
		}),
	)
}
