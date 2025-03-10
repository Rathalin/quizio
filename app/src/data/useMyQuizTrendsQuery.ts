import { apiClient, InferFetchError, InferFetchResult, throwOnError } from '@/api-client';
import { AuthorizationHeader, useAuthHeader } from '@/custom-hooks/useAuthHeader';
import { useQuery } from '@tanstack/react-query';

export function useMyQuizTrendsQuery(uuid: string, fromDate: string, toDate: string) {
  const authHeader = useAuthHeader();

  const queryKey = ['getMyQuizTrends', uuid, fromDate, toDate];

  return {
    queryKey,
    ...useQuery<InferFetchResult<typeof fetchMyQuizTrends>, InferFetchError<typeof fetchMyQuizTrends>>({
      queryKey,
      queryFn: () => throwOnError(() => fetchMyQuizTrends(uuid, fromDate, toDate, authHeader)),
      enabled: authHeader != null,
    }),
  };
}

export async function fetchMyQuizTrends(
  uuid: string,
  fromDate: string,
  toDate: string,
  authHeader: AuthorizationHeader,
) {
  return apiClient.GET('/a/quiz/{uuid}/trends', {
    params: {
      path: {
        uuid,
      },
      query: {
        from: fromDate,
        to: toDate,
      },
    },
    headers: authHeader,
  });
}
