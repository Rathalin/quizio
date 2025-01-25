import { client, InferFetchError, InferFetchResult, throwOnError } from '@/api-client';
import { useQuery } from '@tanstack/react-query';

export function useUserProfileQuery(uuid: string) {
  return useQuery<InferFetchResult<typeof fetchUserProfile>, InferFetchError<typeof fetchUserProfile>>({
    queryKey: ['getUserProfile', uuid],
    queryFn: () => throwOnError(() => fetchUserProfile(uuid)),
  });
}

export async function fetchUserProfile(uuid: string) {
  return client.GET('/user-profile/{uuid}', {
    params: {
      path: {
        uuid,
      },
    },
  });
}
