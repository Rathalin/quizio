import { useSession } from 'next-auth/react';
import { useMemo } from 'react';

export type AuthorizationHeader =
  | {
      Authorization: `Bearer ${string}`;
    }
  | undefined;

export function useAuthHeader(): AuthorizationHeader | undefined {
  const { data: session } = useSession();

  return useMemo(() => {
    if (session == null) {
      return undefined;
    }
    return {
      Authorization: `Bearer ${session.user.accessToken}` as const,
    };
  }, [session]);
}
