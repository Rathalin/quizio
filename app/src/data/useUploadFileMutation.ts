import { apiClient, InferFetchError, InferFetchResult, throwOnError, UploadFileRequestData } from '@/api-client';
import { AuthorizationHeader, useAuthHeader } from '@/custom-hooks/useAuthHeader';
import { useMutation } from '@tanstack/react-query';

export function useUploadFileMutation() {
  const authHeader = useAuthHeader();
  return useMutation<InferFetchResult<typeof uploadFile>, InferFetchError<typeof uploadFile>, UploadFileRequestData>({
    mutationKey: ['uploadFile'],
    mutationFn: (data: UploadFileRequestData) => throwOnError(() => uploadFile(data, authHeader)),
  });
}

function uploadFile(data: UploadFileRequestData, authHeader: AuthorizationHeader) {
  return apiClient.POST('/a/upload', {
    body: data,
    headers: authHeader,
  });
}
