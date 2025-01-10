import {
  client,
  InferFetchError,
  InferFetchResult,
  throwOnError,
} from '@/api-client';
import { useQuery } from '@tanstack/react-query';

export function useQuizQuery(uuid: string) {
  return useQuery<
    InferFetchResult<typeof fetchQuiz>,
    InferFetchError<typeof fetchQuiz>
  >({
    queryKey: ['getQuiz', uuid],
    queryFn: () => throwOnError(() => fetchQuiz(uuid)),
  });
}

function fetchQuiz(uuid: string) {
  return client.GET('/quiz/{uuid}', {
    params: {
      path: {
        uuid,
      },
    },
  });
}
