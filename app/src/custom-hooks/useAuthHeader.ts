import { useSession } from 'next-auth/react';
import { useMemo } from 'react';

export type AuthorizationHeader = {
  Authorization: `Bearer ${string}`;
};

export function useAuthHeader(): AuthorizationHeader {
  const { data: session } = useSession();

  const authHeader = useMemo(
    () => ({
      Authorization: `Bearer ${session?.user.accessToken ?? ''}` as const,
    }),
    [session?.user.accessToken]
  );

  return authHeader;
}
