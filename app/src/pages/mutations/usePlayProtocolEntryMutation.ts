import { client } from '@/api-client';
import { useMutation } from '@tanstack/react-query';

type PlayProtocolEntryMutationData = {
  quizUuid: string;
  userUuid: string | null;
};

export function usePlayProtocolEntryMutation() {
  return useMutation({
    mutationKey: ['postProtocolEntry'],
    mutationFn: ({ quizUuid, userUuid }: PlayProtocolEntryMutationData) =>
      pushPlayProtocolEntry(quizUuid, userUuid),
  });
}

function pushPlayProtocolEntry(quizUuid: string, userUuid: string | null) {
  return client.POST('/play-protocol-entry', {
    body: {
      quizUuid,
      userUuid,
    },
  });
}
