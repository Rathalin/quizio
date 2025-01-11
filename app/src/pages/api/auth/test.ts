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
        const { data, error } = await client.POST('/auth/signin', {
          body: {
            username: credentials!.username,
            password: credentials!.password,
          },
        });
        // TODO
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      return { ...token, ...user };
    },
    async session({ session, token, user }) {
      // TODO
      return session;
    },
  },
  pages: {
    signIn: '/auth/signin',
    // error: '/auth/error',
    signOut: '/auth/signout',
  },
};

export default NextAuth(authOptions);
