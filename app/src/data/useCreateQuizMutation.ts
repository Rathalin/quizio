import {
  client,
  CreateQuizRequestData,
  InferFetchError,
  InferFetchResult,
  throwOnError,
} from '@/api-client';
import {
  AuthorizationHeader,
  useAuthHeader,
} from '@/custom-hooks/useAuthHeader';
import { useMutation } from '@tanstack/react-query';

export function useCreateQuizMutation() {
  const authHeader = useAuthHeader();
  return useMutation<
    InferFetchResult<typeof createQuiz>,
    InferFetchError<typeof createQuiz>,
    CreateQuizRequestData
  >({
    mutationKey: ['createQuiz'],
    mutationFn: (data: CreateQuizRequestData) =>
      throwOnError(() => createQuiz(data, authHeader)),
  });
}

async function createQuiz(
  data: CreateQuizRequestData,
  authHeader: AuthorizationHeader
) {
  return client.POST('/a/quiz/create', {
    body: data,
    headers: authHeader,
  });
}
