import {
  client,
  InferFetchError,
  InferFetchResult,
  throwOnError,
} from '@/api-client';
import { seconds } from '@/utilities/time';
import { useInfiniteQuery } from '@tanstack/react-query';

export function useQuizzesInfiniteQuery(pageSize: number) {
  return useInfiniteQuery<
    InferFetchResult<typeof fetchQuizzes>,
    InferFetchError<typeof fetchQuizzes>
  >({
    queryKey: ['getQuizzesInfinite'],
    queryFn: ({ pageParam = 0 }) =>
      throwOnError(() => fetchQuizzes(pageParam, pageSize)),
    getNextPageParam: ({ meta: { page, totalPages } }, _pages) => {
      if (page < totalPages) {
        return page + 1;
      }
      return undefined;
    },
    staleTime: seconds(30),
  });
}

async function fetchQuizzes(page: number, pageSize: number) {
  return client.GET('/quizzes', {
    params: {
      query: {
        page,
        pageSize,
      },
    },
  });
}
