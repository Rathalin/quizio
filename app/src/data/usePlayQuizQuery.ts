import {
  client,
  InferFetchError,
  InferFetchResult,
  throwOnError,
} from '@/api-client';
import { useQuery } from '@tanstack/react-query';

export function usePlayQuizQuery(uuid: string) {
  return useQuery<
    InferFetchResult<typeof playQuiz>,
    InferFetchError<typeof playQuiz>
  >({
    queryKey: ['getQuiz', uuid],
    queryFn: () => throwOnError(() => playQuiz(uuid)),
    staleTime: Infinity,
  });
}

export function playQuiz(uuid: string) {
  return client.GET('/play/{uuid}', {
    params: {
      path: {
        uuid,
      },
    },
  });
}
