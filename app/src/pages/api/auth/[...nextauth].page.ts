import { AuthOptions } from 'next-auth';
import NextAuth from 'next-auth/next';
import CredentialsProvider from 'next-auth/providers/credentials';
import { client } from '@/api-client';

export const authOptions: AuthOptions = {
  session: {
    strategy: 'jwt',
  },
  providers: [
    CredentialsProvider({
      type: 'credentials',
      credentials: {
        username: { type: 'text' },
        password: { type: 'password' },
      },
      async authorize(credentials, req) {
        console.log(
          'authorize-callback: credentials',
          credentials?.username,
          credentials?.password
        );
        // Call the SignIn endpoint
        const { data, error } = await client.POST('/auth/signin', {
          body: {
            username: credentials!.username,
            password: credentials!.password,
          },
        });

        if (error != null) {
          console.log(`authorize-callback: error`, error);
          return null;
        }
        console.log('authorize-callback: data', data);
        return {
          id: data.user.uuid, // TODO Why do I need this?
          accessToken: data.accessToken,
          refreshToken: data.refreshToken,
          ...data.user,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, account }) {
      console.log('jwt-callback: token', token);
      console.log('jwt-callback: account', account);
      return {
        ...token,
        ...account,
      };
    },
    async session({ session, token, ...other }) {
      console.log('session-callback: session', session);
      console.log('session-callback: user', other);
      session.user = {
        accessToken: token.accessToken,
        refreshToken: token.refreshToken,
        ...other,
      };
      return session;
    },
  },
  pages: {
    signIn: '/auth/signin',
    signOut: '/auth/signout',
  },
};

export default NextAuth(authOptions);
