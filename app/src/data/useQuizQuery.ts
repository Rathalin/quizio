import { apiClient, InferFetchError, InferFetchResult, throwOnError } from '@/api-client';
import { AuthorizationHeader, useAuthHeader } from '@/custom-hooks/useAuthHeader';
import { useQuery } from '@tanstack/react-query';

export function useQuizQuery(uuid: string) {
  const authHeader = useAuthHeader();

  return useQuery<InferFetchResult<typeof fetchQuiz>, InferFetchError<typeof fetchQuiz>>({
    queryKey: ['getQuiz', uuid],
    queryFn: () => throwOnError(() => fetchQuiz(uuid, authHeader)),
    enabled: authHeader != null,
  });
}

export function fetchQuiz(uuid: string, authHeader: AuthorizationHeader) {
  return apiClient.GET('/a/quiz/{uuid}', {
    params: {
      path: {
        uuid,
      },
    },
    headers: authHeader,
  });
}
