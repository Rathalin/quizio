import {
  client,
  InferFetchError,
  InferFetchResult,
  throwOnError,
} from '@/api-client';
import {
  AuthorizationHeader,
  useAuthHeader,
} from '@/custom-hooks/useAuthHeader';
import { useQuery } from '@tanstack/react-query';
import { useSession } from 'next-auth/react';

export function useMyUserProfileQuery() {
  const { data: session } = useSession();
  const authHeader = useAuthHeader();
  return useQuery<
    InferFetchResult<typeof fetchMyUserProfile>,
    InferFetchError<typeof fetchMyUserProfile>
  >({
    queryKey: ['getMyUserProfile', session?.user.uuid],
    queryFn: () => throwOnError(() => fetchMyUserProfile(authHeader)),
    enabled: session?.user.uuid != null,
  });
}

export async function fetchMyUserProfile(authHeader: AuthorizationHeader) {
  return client.GET('/a/me', {
    headers: authHeader,
  });
}
