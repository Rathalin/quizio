import { Session } from 'next-auth';
import { useMemo } from 'react';

export function useAuthHeader(session: Session | null) {
  const authHeader = useMemo(
    () => ({
      Authorization: `Bearer ${session?.user.acessToken}`,
    }),
    [session?.user.acessToken]
  );

  return {
    authHeader,
  };
}
