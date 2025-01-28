export declare module 'next-auth' {
  /**
   * Returned by `useSession`, `getSession` and received as a prop on the `SessionProvider` React Context
   */
  export interface Session {
    user: {
      uuid: string;
      accessToken: string;
      refreshToken: string;
    };
  }
}
