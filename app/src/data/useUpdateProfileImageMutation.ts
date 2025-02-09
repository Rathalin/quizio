import { apiClient, throwOnError, UpdateUserProfileImageRequest } from '@/api-client';
import { AuthorizationHeader, useAuthHeader } from '@/custom-hooks/useAuthHeader';
import { useMutation } from '@tanstack/react-query';

export function useUpdateProfileImageMutation() {
  const authHeader = useAuthHeader();
  return useMutation({
    mutationKey: ['updateUserProfileImage'],
    mutationFn: (data: UpdateUserProfileImageRequest) => throwOnError(() => updateUserProfileImage(data, authHeader)),
  });
}

async function updateUserProfileImage(data: UpdateUserProfileImageRequest, authHeader: AuthorizationHeader) {
  return apiClient.POST('/a/update-profile-image', {
    body: data,
    headers: authHeader,
  });
}
