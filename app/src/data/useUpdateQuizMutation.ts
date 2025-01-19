import { client, EditQuizRequestData, throwOnError } from '@/api-client';
import {
  AuthorizationHeader,
  useAuthHeader,
} from '@/custom-hooks/useAuthHeader';
import { useMutation } from '@tanstack/react-query';

export function useUpdateQuizMutation(uuid: string) {
  const authHeader = useAuthHeader();
  return useMutation({
    mutationKey: ['editQuiz'],
    mutationFn: (data: EditQuizRequestData) =>
      throwOnError(() => editQuiz(uuid, data, authHeader)),
  });
}

async function editQuiz(
  uuid: string,
  data: EditQuizRequestData,
  authHeader: AuthorizationHeader
) {
  return client.POST('/a/quiz/edit/{uuid}', {
    params: {
      path: {
        uuid,
      },
    },
    body: data,
    headers: authHeader,
  });
}
