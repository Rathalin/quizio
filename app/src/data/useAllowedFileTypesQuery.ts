import { apiClient, InferFetchError, InferFetchResult, throwOnError } from '@/api-client';
import { useQuery } from '@tanstack/react-query';

export function useAllowedFileTypesQuery() {
  return useQuery<InferFetchResult<typeof fetchAllowedFileTypes>, InferFetchError<typeof fetchAllowedFileTypes>>({
    queryKey: ['getAllowedFileTypes'],
    queryFn: () => throwOnError(() => fetchAllowedFileTypes()),
    staleTime: Infinity,
  });
}

export async function fetchAllowedFileTypes() {
  return apiClient.GET('/allowed-file-types');
}
