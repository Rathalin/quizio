import {
  client,
  GetQuizzesRequestQuery,
  InferFetchError,
  InferFetchResult,
  throwOnError,
} from '@/api-client';
import {
  AuthorizationHeader,
  useAuthHeader,
} from '@/custom-hooks/useAuthHeader';
import { seconds } from '@/utilities/time';
import { useInfiniteQuery } from '@tanstack/react-query';

export function useQuizzesInfiniteQuery(
  query: Omit<GetQuizzesRequestQuery, 'page'>
) {
  const authHeader = useAuthHeader();
  return useInfiniteQuery<
    InferFetchResult<typeof fetchQuizzes>,
    InferFetchError<typeof fetchQuizzes>
  >({
    queryKey: ['getQuizzesInfinite', query],
    queryFn: ({ pageParam = 0 }) =>
      throwOnError(() =>
        fetchQuizzes({ ...query, page: pageParam }, authHeader)
      ),
    getNextPageParam: ({ meta: { page, totalPages } }, _pages) => {
      if (page < totalPages) {
        return page + 1;
      }
      return undefined;
    },
    staleTime: seconds(30),
  });
}

async function fetchQuizzes(
  query: GetQuizzesRequestQuery,
  authHeader: AuthorizationHeader | undefined
) {
  return client.GET('/quizzes', {
    params: {
      query,
    },
    headers: authHeader,
  });
}
