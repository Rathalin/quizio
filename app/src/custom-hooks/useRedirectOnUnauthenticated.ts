import { useRouter } from 'next/router';
import { useEffect } from 'react';

export function useRedirectOnUnauthenticated(status: string) {
  const router = useRouter();

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/');
    }
  }, [router, status]);
}
