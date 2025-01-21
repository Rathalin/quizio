import { AuthOptions } from 'next-auth';
import NextAuth from 'next-auth/next';
import CredentialsProvider from 'next-auth/providers/credentials';
import { client } from '@/api-client';
import { jwtDecode } from 'jwt-decode';
import { AuthorizationHeader } from '@/custom-hooks/useAuthHeader';

interface DecodedToken {
  exp: number; // Expiry timestamp in seconds
}

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
    async jwt({ token, user }) {
      if (user) {
        // Initial sign-in
        token = {
          ...token,
          ...user,
        };
      } else {
        // Check if the access token is expired
        const decoded = jwtDecode<DecodedToken>(token.accessToken as string);
        const isExpired = Date.now() >= decoded.exp * 1000;
        if (isExpired) {
          console.info('Access token expired. Refreshing token...');
          try {
            const { data, error } = await client.POST('/refresh-token', {
              body: { refreshToken: token.refreshToken as string },
              headers: {
                Authorization: `Bearer ${token.accessToken}`,
              } satisfies AuthorizationHeader,
            });

            if (error) {
              console.error('Error refreshing token:', error);
              throw new Error('Failed to refresh access token');
            }

            token.accessToken = data.accessToken; // Update access token
            // token.refreshToken = data.refreshToken || token.refreshToken; // Update refresh token if provided
          } catch (err) {
            console.error('Token refresh failed:', err);
            throw err;
          }
        }
      }
      return token;
    },
    async session({ session, token }) {
      session.user = {
        ...token,
        ...session.user,
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
