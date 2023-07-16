import { signOut } from 'next-auth/react';
import { useRouter } from 'next/router';
import { useEffect } from 'react';
import { z } from 'zod';

export function useHandleGQLUnauthorized(errors: unknown[]) {
  const router = useRouter();
  useEffect(() => {
    try {
      const gqlErrors = GqlErrorsSchema.parse(errors);
      gqlErrors.forEach((e) => {
        if (e != null && e.response.status === 401) {
          signOut().then(() => router.push('/?sessionExpired=true'));
        }
      });
    } catch (e) {
      console.error('useHandleGQLUnauthorized', e);
    }
  }, [errors, router]);
}

const GqlErrorsSchema = z.array(
  z
    .object({
      response: z.object({
        status: z.number(),
      }),
    })
    .nullable()
);
