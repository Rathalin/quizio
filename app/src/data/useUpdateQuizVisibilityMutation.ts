import { apiClient, InferFetchError, InferFetchResult, throwOnError } from '@/api-client';
import { AuthorizationHeader, useAuthHeader } from '@/custom-hooks/useAuthHeader';
import { useMutation } from '@tanstack/react-query';

type UpdateQuizVisibilityMutationVariables = {
  visibility: 'public' | 'private';
};

export function useUpdateQuizVisibilityMutation(uuid: string) {
  const authHeader = useAuthHeader();

  return useMutation<
    InferFetchResult<typeof updateQuizVisibility>,
    InferFetchError<typeof updateQuizVisibility>,
    UpdateQuizVisibilityMutationVariables
  >({
    mutationKey: ['updateQuizVisibility', uuid],
    mutationFn: ({ visibility }) => throwOnError(() => updateQuizVisibility(uuid, visibility === 'public', authHeader)),
  });
}

async function updateQuizVisibility(uuid: string, isPublished: boolean, authHeader: AuthorizationHeader) {
  return apiClient.POST('/a/quiz/{uuid}/visibility', {
    params: {
      path: {
        uuid,
      },
    },
    body: {
      isPublished,
    },
    headers: authHeader,
  });
}
