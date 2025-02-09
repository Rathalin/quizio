import { apiClient, InferFetchError, InferFetchResult, throwOnError } from '@/api-client';
import { AuthorizationHeader, useAuthHeader } from '@/custom-hooks/useAuthHeader';
import { useMutation } from '@tanstack/react-query';

type DeleteFileMutationData = {
  filename: string;
};

export function useDeleteFileMutation() {
  const authHeader = useAuthHeader();
  return useMutation<InferFetchResult<typeof deleteFile>, InferFetchError<typeof deleteFile>, DeleteFileMutationData>({
    mutationKey: ['deleteFile'],
    mutationFn: (data: DeleteFileMutationData) => throwOnError(() => deleteFile(data.filename, authHeader)),
  });
}

async function deleteFile(filename: string, authHeader: AuthorizationHeader) {
  return apiClient.DELETE('/a/upload', {
    params: {
      query: {
        filename,
      },
    },
    headers: authHeader,
  });
}
