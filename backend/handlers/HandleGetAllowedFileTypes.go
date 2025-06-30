package handlers

import (
	"context"
	"fmt"
	"strings"

	"github.com/swaggest/usecase"
)

func (dbw *DBWrapper) HandleGetAllowedFileTypes() usecase.Interactor {
	type getAllowedFileTypesRequest struct{}

	type getAllowedFileTypesResponse struct {
		AllowedImageFileTypes string `json:"allowedImageFileTypes" required:"true"`
		AllowedAudioFileTypes string `json:"allowedAudioFileTypes" required:"true"`
	}

	return usecase.NewInteractor(func(ctx context.Context, input getAllowedFileTypesRequest, output *getAllowedFileTypesResponse) error {	
		// Append dot ("png" -> ".png")
		allowedImageTypesWithDots := []string{}
		for i := range AllowedImageTypes {
			allowedImageTypesWithDots = append(allowedImageTypesWithDots, fmt.Sprintf(".%s", AllowedImageTypes[i]))
		}

		allowedAudioTypesWithDots := []string{}
		for i := range AllowedAudioTypes {
			allowedAudioTypesWithDots = append(allowedAudioTypesWithDots, fmt.Sprintf(".%s", AllowedAudioTypes[i]))
		}

		*output = getAllowedFileTypesResponse{
			AllowedImageFileTypes: strings.Join(allowedImageTypesWithDots, ", "),
			AllowedAudioFileTypes: strings.Join(allowedAudioTypesWithDots, ", "),
		}
		return nil
	})
}
