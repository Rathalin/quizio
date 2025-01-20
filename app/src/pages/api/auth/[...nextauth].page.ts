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
      async authorize(credentials) {
        // Call the SignIn endpoint
        const { data, error } = await client.POST('/signin', {
          body: {
            username: credentials!.username,
            password: credentials!.password,
          },
        });

        if (error != null) {
          console.error(`Signin-error`, error);
          return null;
        }
        console.info(`Signed in as ${data.user.username}`);
        return {
          id: data.user.uuid,
          ...data.user,
          accessToken: data.accessToken,
          refreshToken: data.refreshToken,
        };
      },
    }),
  ],
  callbacks: {
    async session({ session, token }) {
      session.user = {
        ...token,
        ...session.user,
      };
      return session;
    },
    async jwt({ token, user }) {
      if (user) {
        token = {
          ...token,
          ...user,
        };
      }
      return token;
    },
  },
  pages: {
    signIn: '/auth/signin',
    signOut: '/auth/signout',
  },
};

export default NextAuth(authOptions);
