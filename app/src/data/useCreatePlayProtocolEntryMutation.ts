import { apiClient, InferFetchError, InferFetchResult, throwOnError } from '@/api-client';
import { AuthorizationHeader, useAuthHeader } from '@/custom-hooks/useAuthHeader';
import { useMutation } from '@tanstack/react-query';

type PlayProtocolEntryMutationData = {
  quizUuid: string;
};

export function useCreatePlayProtocolEntryMutation() {
  const authHeader = useAuthHeader();
  return useMutation<
    InferFetchResult<typeof pushPlayProtocolEntry>,
    InferFetchError<typeof pushPlayProtocolEntry>,
    PlayProtocolEntryMutationData
  >({
    mutationKey: ['postProtocolEntry'],
    mutationFn: ({ quizUuid }: PlayProtocolEntryMutationData) =>
      throwOnError(() => pushPlayProtocolEntry(quizUuid, authHeader)),
  });
}

function pushPlayProtocolEntry(quizUuid: string, authHeader: AuthorizationHeader) {
  if (authHeader != null) {
    return apiClient.POST('/me/create-play-protocol-entry', {
      body: {
        quizUuid,
      },
      headers: authHeader,
    });
  }
  return apiClient.POST('/create-play-protocol-entry', {
    body: {
      quizUuid,
    },
  });
}
