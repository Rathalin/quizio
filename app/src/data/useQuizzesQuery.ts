import {
  client,
  GetQuizzesRequestQuery,
  InferFetchError,
  InferFetchResult,
  throwOnError,
} from '@/api-client';
import { seconds } from '@/utilities/time';
import { useInfiniteQuery } from '@tanstack/react-query';

export function useQuizzesInfiniteQuery(
  query: Omit<GetQuizzesRequestQuery, 'page'>
) {
  return useInfiniteQuery<
    InferFetchResult<typeof fetchQuizzes>,
    InferFetchError<typeof fetchQuizzes>
  >({
    queryKey: ['getQuizzesInfinite', query.sort, query.sortDirection],
    queryFn: ({ pageParam }) =>
      throwOnError(() =>
        fetchQuizzes({ ...query, page: (pageParam as number) ?? 0 })
      ),
    getNextPageParam: ({ meta: { page, totalPages } }, _pages) => {
      if (page < totalPages) {
        return page + 1;
      }
      return undefined;
    },
    initialPageParam: 0,
    staleTime: seconds(30),
  });
}

export async function fetchQuizzes(query: GetQuizzesRequestQuery) {
  return client.GET('/quizzes', {
    params: {
      query,
    },
  });
}
