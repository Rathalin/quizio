import {
  client,
  InferFetchError,
  InferFetchResult,
  throwOnError,
} from '@/api-client';
import { seconds } from '@/utilities/time';
import { useInfiniteQuery, useQuery } from '@tanstack/react-query';

export function useQuizzesQuery(page: number, size: number) {
  return useQuery<
    InferFetchResult<typeof fetchQuizzes>,
    InferFetchError<typeof fetchQuizzes>
  >({
    queryKey: ['getQuizzesNew'],
    queryFn: () => throwOnError(() => fetchQuizzes(page, size)),
  });
}

export function useQuizzesInfiniteQuery(size: number) {
  return useInfiniteQuery<
    InferFetchResult<typeof fetchQuizzes>,
    InferFetchError<typeof fetchQuizzes>
  >({
    queryKey: ['getQuizzesInfinite'],
    queryFn: ({ pageParam = 0 }) =>
      throwOnError(() => fetchQuizzes(pageParam, size)),
    getNextPageParam: ({ meta: { page, totalPages } }, _pages) => {
      if (page < totalPages) {
        return page + 1;
      }
      return undefined;
    },
    staleTime: seconds(20),
  });
}

function fetchQuizzes(page: number, size: number) {
  return client.GET('/quizzes', {
    params: {
      query: {
        page,
        size,
      },
    },
  });
}
