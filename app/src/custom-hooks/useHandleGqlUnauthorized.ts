import { signOut } from 'next-auth/react';
import { useRouter } from 'next/router';
import { useEffect } from 'react';
import { z } from 'zod';

export function useHandleGqlUnauthorized(errors: unknown[]) {
  const router = useRouter();

  useEffect(() => {
    try {
      const gqlErrors = GqlErrorsSchema.parse(errors);
      gqlErrors.forEach((e) => {
        if (e != null && e.response.status === 401) {
          signOut({ callbackUrl: '/?sessionExpired=true' });
        }
      });
    } catch (e) {
      console.error('Session Expired', e);
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
