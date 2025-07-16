import { apiClient, InferFetchError, InferFetchResult, throwOnError } from '@/api-client';
import { AuthorizationHeader, useAuthHeader } from '@/custom-hooks/useAuthHeader';
import { useMutation } from '@tanstack/react-query';

export function useDeleteQuizMutation(uuid: string) {
  const authHeader = useAuthHeader();
  return useMutation<InferFetchResult<typeof deleteQuiz>, InferFetchError<typeof deleteQuiz>>({
    mutationKey: ['deleteQuiz', uuid],
    mutationFn: () => throwOnError(() => deleteQuiz(uuid, authHeader)),
  });
}

async function deleteQuiz(uuid: string, authHeader: AuthorizationHeader) {
  return apiClient.DELETE('/me/quizzes/{uuid}', {
    params: {
      path: {
        uuid,
      },
    },
    headers: authHeader,
  });
}
