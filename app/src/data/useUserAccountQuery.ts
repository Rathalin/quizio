import { client, throwOnError } from '@/api-client';
import { AuthorizationHeader, useAuthHeader } from '@/custom-hooks/useAuthHeader';
import { useQuery } from '@tanstack/react-query';
import { useSession } from 'next-auth/react';
import { useMemo } from 'react';

export function useUserAccountQuery() {
  const authHeader = useAuthHeader();
  const { data: session } = useSession();
  const queryKey = useMemo(() => ['getUserAccount', session?.user.uuid], [session?.user.uuid]);

  return {
    ...useQuery({
      queryKey,
      queryFn: () => throwOnError(() => getUserAccount(authHeader)),
      enabled: authHeader != null,
    }),
    queryKey,
  };
}

async function getUserAccount(authHeader: AuthorizationHeader) {
  return client.GET('/a/user-account', {
    headers: authHeader,
  });
}
