import { User as ApiUser } from '@/api-client';

declare module 'next-auth' {
  /**
   * Returned by `useSession`, `getSession` and received as a prop on the `SessionProvider` React Context
   */
  // interface Session {
  //   user: User;
  // }

  export interface Session {
    user: {
      uuid: ApiUser['uuid'];
      username: ApiUser['username'];
      isConfirmed: ApiUser['isConfirmed'];
      isBlocked: ApiUser['isBlocked'];
      profileImageUrl?: ApiUser['profileImageUrl'];
      accessToken: string;
      refreshToken: string;
    };
  }
}
