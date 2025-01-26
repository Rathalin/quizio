export declare module 'next-auth' {
  /**
   * Returned by `useSession`, `getSession` and received as a prop on the `SessionProvider` React Context
   */
  export interface Session {
    user: {
      uuid: string;
      username: string;
      isConfirmed: boolean;
      isBlocked: boolean;
      profileImageUrl: string | null;
      accessToken: string;
      refreshToken: string;
    };
  }
}
