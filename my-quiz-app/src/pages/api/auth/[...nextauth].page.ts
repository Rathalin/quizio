import { AuthOptions } from 'next-auth';
import NextAuth from 'next-auth/next';
import CredentialsProvider from 'next-auth/providers/credentials';
import { StrapiUserReponse } from '../../../../types/strapi.types';

export const authOptions: AuthOptions = {
  session: {
    strategy: 'jwt',
  },
  providers: [
    CredentialsProvider({
      type: 'credentials',
      credentials: {
        identifier: { type: 'text' },
        password: { type: 'password' },
      },
      async authorize(credentials, req) {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/auth/local`,
          {
            headers: {
              'Content-Type': 'application/json',
            },
            method: 'POST',
            body: JSON.stringify({
              identifier: credentials?.identifier,
              password: credentials?.password,
            }),
          }
        );
        if (response.ok) {
          return await response.json();
        }
        return null;
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      return { ...token, ...user };
    },
    async session({ session, token, user }) {
      const responseData = token as StrapiUserReponse;
      session.user = {
        id: responseData.user.id,
        username: responseData.user.username,
        email: responseData.user.email,
        createdAt: responseData.user.createdAt,
        acessToken: responseData.jwt,
      };
      return session;
    },
  },
  pages: {
    signIn: '/auth/signin',
    error: '/auth/error',
    signOut: '/auth/signout',
  },
};

export default NextAuth(authOptions);
