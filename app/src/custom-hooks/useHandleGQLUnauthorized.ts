import { signOut } from 'next-auth/react';
import { useEffect } from 'react';
import { z } from 'zod';

export function useHandleGQLUnauthorized(errors: unknown[]) {
  useEffect(() => {
    try {
      const gqlErrors = GqlErrorsSchema.parse(errors);
      gqlErrors.forEach((e) => {
        if (e != null && e.response.status === 401) {
          signOut();
        }
      });
    } catch (e) {
      console.error('useHandleGQLUnauthorized', e);
    }
  }, [errors]);
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
