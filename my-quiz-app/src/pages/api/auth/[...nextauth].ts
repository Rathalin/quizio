import { AuthOptions } from 'next-auth';
import NextAuth from 'next-auth/next';
import GoogleProvider from 'next-auth/providers/google';
import { cookies } from 'next/dist/client/components/headers';

export const authOptions: AuthOptions = {
  providers: [],
  session: {
    strategy: 'jwt',
  },
  // callbacks: {
  //   async jwt({ token, account, profile }) {
  //     // Persist the OAuth access_token and or the user id to the token right after signin
  //     if (account != null) {
  //       token.accessToken = account.access_token
  //       token.id = profile.id
  //     }
  //     return token
  //   }
  // }
};

export default NextAuth(authOptions);
