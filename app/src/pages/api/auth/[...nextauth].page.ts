import { Session, AuthOptions } from 'next-auth';
import NextAuth from 'next-auth/next';
import CredentialsProvider from 'next-auth/providers/credentials';
import { client, SignInResponse } from '@/api-client';

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
        // console.log(
        //   'authorize credentials',
        //   credentials?.username,
        //   credentials?.password
        // );
        // Call the SignIn endpoint
        const { data, error } = await client.POST('/signin', {
          body: {
            username: credentials!.username,
            password: credentials!.password,
          },
        });

        if (error != null) {
          console.log(`Signin-error`, error);
          return null;
        }
        console.log(`Signed in as ${data.user.username}`);
        return {
          id: data.user.uuid,
          name: data.user.username,
          image: data.user.profileImageUrl,
          accessToken: data.accessToken,
          refreshToken: data.refreshToken,
        };
      },
    }),
  ],
  callbacks: {
    async session({ session, token }) {
      const data = token as SignInResponse;
      session.user = {
        ...data.user,
        accessToken: data.accessToken,
        refreshToken: data.refreshToken,
      };
      return session;
    },
    async jwt({ token, user }) {
      return { ...token, ...user };
    },
  },
  pages: {
    signIn: '/auth/signin',
    signOut: '/auth/signout',
  },
};

export default NextAuth(authOptions);
