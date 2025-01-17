import { client } from '@/api-client';
import {
  AuthorizationHeader,
  useAuthHeader,
} from '@/custom-hooks/useAuthHeader';
import { useMutation } from '@tanstack/react-query';

type CreateQuizMutationData = {
  quizUuid: string;
  userUuid: string | null;
};

export function useCreateQuizMutation() {
  const authHeader = useAuthHeader();
  return useMutation({
    mutationKey: ['createQuiz'],
    mutationFn: ({ quizUuid, userUuid }: CreateQuizMutationData) =>
      createQuiz(quizUuid, userUuid, authHeader),
  });
}

function createQuiz(
  quizUuid: string,
  userUuid: string | null,
  authHeader: AuthorizationHeader
) {
  return client.POST('/a/play-protocol-entry', {
    body: {
      quizUuid,
      userUuid,
    },
    headers: authHeader,
  });
}
