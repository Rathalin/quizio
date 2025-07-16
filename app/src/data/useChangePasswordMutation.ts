import { ChangePasswordReqest, apiClient, InferFetchError, InferFetchResult, throwOnError } from '@/api-client';
import { AuthorizationHeader, useAuthHeader } from '@/custom-hooks/useAuthHeader';
import { useMutation } from '@tanstack/react-query';

export function useChangePasswordMutation() {
  const authHeader = useAuthHeader();
  return useMutation<
    InferFetchResult<typeof changePassword>,
    InferFetchError<typeof changePassword>,
    ChangePasswordReqest
  >({
    mutationKey: ['changePassword'],
    mutationFn: (data: ChangePasswordReqest) => throwOnError(() => changePassword(data, authHeader)),
    retry: false,
  });
}

async function changePassword(data: ChangePasswordReqest, authHeader: AuthorizationHeader) {
  return apiClient.POST('/me/change-password', {
    body: data,
    headers: authHeader,
  });
}
