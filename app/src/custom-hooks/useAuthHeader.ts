import { useSession } from 'next-auth/react';
import { useMemo } from 'react';

export function useAuthHeader() {
  const { data: session } = useSession();
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
