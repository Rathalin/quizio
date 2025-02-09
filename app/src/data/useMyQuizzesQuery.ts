import { apiClient, GetQuizzesRequestQuery, InferFetchError, InferFetchResult, throwOnError } from '@/api-client';
import { AuthorizationHeader, useAuthHeader } from '@/custom-hooks/useAuthHeader';
import { seconds } from '@/utilities/time';
import { useInfiniteQuery } from '@tanstack/react-query';
import { useSession } from 'next-auth/react';

export function useMyQuizzesQuery(query: Omit<GetQuizzesRequestQuery, 'page'>) {
  const { data: session } = useSession();
  const authHeader = useAuthHeader();

  const queryKey = ['getMyQuizzesInfinite', session?.user.uuid, query.sortDirection, query.sortOption];

  return {
    queryKey,
    ...useInfiniteQuery<InferFetchResult<typeof fetchMyQuizzes>, InferFetchError<typeof fetchMyQuizzes>>({
      queryKey,
      queryFn: ({ pageParam }) =>
        throwOnError(() => fetchMyQuizzes({ ...query, page: (pageParam as number) ?? 0 }, authHeader)),
      getNextPageParam: ({ meta: { page, totalPages } }, _pages) => {
        if (page < totalPages) {
          return page + 1;
        }
        return undefined;
      },
      initialPageParam: 0,
      staleTime: seconds(30),
    }),
  };
}

export async function fetchMyQuizzes(query: GetQuizzesRequestQuery, authHeader: AuthorizationHeader) {
  return apiClient.GET('/a/my-quizzes', {
    params: {
      query,
    },
    headers: authHeader,
  });
}
