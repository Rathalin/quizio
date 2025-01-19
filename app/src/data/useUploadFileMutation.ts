import {
  client,
  InferFetchError,
  InferFetchResult,
  throwOnError,
  UploadFileRequestData,
} from '@/api-client';
import {
  AuthorizationHeader,
  useAuthHeader,
} from '@/custom-hooks/useAuthHeader';
import { useMutation } from '@tanstack/react-query';

export function useUploadFileMutation() {
  const authHeader = useAuthHeader();
  return useMutation<
    InferFetchResult<typeof uploadFile>,
    InferFetchError<typeof uploadFile>,
    UploadFileRequestData
  >({
    mutationKey: ['uploadFile'],
    mutationFn: (data: UploadFileRequestData) =>
      throwOnError(() => uploadFile(data, authHeader)),
  });
}

function uploadFile(
  data: UploadFileRequestData,
  authHeader: AuthorizationHeader
) {
  console.log(data.filename);
  return client.POST('/a/upload', {
    body: data,
    headers: authHeader,
  });
}
