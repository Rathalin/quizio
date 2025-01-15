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
          'authorize credentials',
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
          console.log(`authorize error`, error);
          return null;
        }
        console.log('authorize data', data);
        return {
          // id: data.user.uuid, // TODO Why do I need this?
          // accessToken: data.accessToken,
          // refreshToken: data.refreshToken,
        };
      },
    }),
  ],
  callbacks: {
    async jwt(params) {
      console.log('jwt params', params);
      return {
        ...params,
      };
    },
    async session({ session, token, ...other }) {
      console.log('session session', session);
      console.log('session user', other);
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
