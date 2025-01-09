import {
  client,
  InferFetchError,
  InferFetchResult,
  throwOnError,
} from '@/api-client';
import { useQuery } from '@tanstack/react-query';

export function useNewQuizzesQuery() {
  return useQuery<
    InferFetchResult<typeof fetchQuizzes>,
    InferFetchError<typeof fetchQuizzes>
  >({
    queryKey: ['getQuizzesNew'],
    queryFn: () => throwOnError(fetchQuizzes),
  });
}

function fetchQuizzes() {
  return client.GET('/quizzes');
}
