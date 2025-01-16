import { client } from '@/api-client';
import {
  AuthorizationHeader,
  useAuthHeader,
} from '@/custom-hooks/useAuthHeader';
import { useMutation } from '@tanstack/react-query';

type PlayProtocolEntryMutationData = {
  quizUuid: string;
  userUuid: string | null;
};

export function usePlayProtocolEntryMutation() {
  const authHeader = useAuthHeader();
  return useMutation({
    mutationKey: ['postProtocolEntry'],
    mutationFn: ({ quizUuid, userUuid }: PlayProtocolEntryMutationData) =>
      pushPlayProtocolEntry(quizUuid, userUuid, authHeader),
  });
}

function pushPlayProtocolEntry(
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
