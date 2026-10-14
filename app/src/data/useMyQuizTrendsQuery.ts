import { apiClient, InferFetchError, InferFetchResult, throwOnError } from '@/api-client';
import { AuthorizationHeader, useAuthHeader } from '@/custom-hooks/useAuthHeader';
import { useQuery } from '@tanstack/react-query';

export function useMyQuizTrendsQuery(uuid: string, fromDate?: string | null, toDate?: string | null) {
  const authHeader = useAuthHeader();

  const queryKey = ['getMyQuizTrends', uuid, fromDate ?? null, toDate ?? null];

  return {
    queryKey,
    ...useQuery<InferFetchResult<typeof fetchMyQuizTrends>, InferFetchError<typeof fetchMyQuizTrends>>({
      queryKey,
      queryFn: () => throwOnError(() => fetchMyQuizTrends(uuid, fromDate ?? undefined, toDate ?? undefined, authHeader)),
      enabled: authHeader != null,
    }),
  };
}

export async function fetchMyQuizTrends(
  uuid: string,
  fromDate: string | undefined | null,
  toDate: string | undefined | null,
  authHeader: AuthorizationHeader,
) {
  return apiClient.GET('/me/quizzes/{uuid}/trends', {
    params: {
      path: {
        uuid,
      },
      query: {
        ...(fromDate ? { from: fromDate } : {}),
        ...(toDate ? { to: toDate } : {}),
      },
    },
    headers: authHeader,
  });
}
