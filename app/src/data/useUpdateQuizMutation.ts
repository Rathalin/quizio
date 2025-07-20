import { apiClient, throwOnError, UpdateQuizRequestData } from '@/api-client';
import { AuthorizationHeader, useAuthHeader } from '@/custom-hooks/useAuthHeader';
import { useMutation } from '@tanstack/react-query';

export function useUpdateQuizMutation(uuid: string) {
  const authHeader = useAuthHeader();
  return useMutation({
    mutationKey: ['upateQuiz'],
    mutationFn: (data: UpdateQuizRequestData) => throwOnError(() => updateQuiz(uuid, data, authHeader)),
  });
}

async function updateQuiz(uuid: string, data: UpdateQuizRequestData, authHeader: AuthorizationHeader) {
  return apiClient.POST('/me/quizzes/{uuid}', {
    params: {
      path: {
        uuid,
      },
    },
    body: data,
    headers: authHeader,
  });
}
