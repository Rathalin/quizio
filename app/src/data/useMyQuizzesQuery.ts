import { apiClient, GetMyQuizzesRequestQuery, InferFetchError, InferFetchResult, throwOnError } from '@/api-client';
import { AuthorizationHeader, useAuthHeader } from '@/custom-hooks/useAuthHeader';
import { seconds } from '@/utilities/time';
import { useQuery } from '@tanstack/react-query';
import { useSession } from 'next-auth/react';

export function useMyQuizzesQuery(query: Omit<GetMyQuizzesRequestQuery, 'page'>) {
  const { data: session } = useSession();
  const authHeader = useAuthHeader();

  const queryKey = ['getMyQuizzes', session?.user.uuid, query.sortDirection, query.sortOption];

  return {
    queryKey,
    ...useQuery<InferFetchResult<typeof fetchMyQuizzes>, InferFetchError<typeof fetchMyQuizzes>>({
      queryKey,
      queryFn: () => throwOnError(() => fetchMyQuizzes(query, authHeader)),
      staleTime: seconds(30),
    }),
  };
}

export async function fetchMyQuizzes(query: GetMyQuizzesRequestQuery, authHeader: AuthorizationHeader) {
  return apiClient.GET('/a/my-quizzes', {
    params: {
      query,
    },
    headers: authHeader,
  });
}
