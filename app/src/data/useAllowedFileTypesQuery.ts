import { apiClient, InferFetchError, InferFetchResult, throwOnError } from '@/api-client';
import { AuthorizationHeader, useAuthHeader } from '@/custom-hooks/useAuthHeader';
import { useQuery } from '@tanstack/react-query';

export function useAllowedFileTypesQuery() {
  const authHeader = useAuthHeader();
  return useQuery<InferFetchResult<typeof fetchAllowedFileTypes>, InferFetchError<typeof fetchAllowedFileTypes>>({
    queryKey: ['getAllowedFileTypes'],
    queryFn: () => throwOnError(() => fetchAllowedFileTypes(authHeader)),
    staleTime: Infinity,
    enabled: authHeader != null,
  });
}

export async function fetchAllowedFileTypes(authHeader: AuthorizationHeader) {
  return apiClient.GET('/me/quizzes/allowed-file-types', {
    headers: authHeader,
  });
}
