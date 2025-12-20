import { AuthOptions } from 'next-auth';
import NextAuth from 'next-auth/next';
import CredentialsProvider from 'next-auth/providers/credentials';
import { apiClient } from '@/api-client';
import { jwtDecode } from 'jwt-decode';
import { AuthorizationHeader } from '@/custom-hooks/useAuthHeader';
import { hours } from '@/utilities/time';

type DecodedToken = {
  userId: number;
  type: 'access' | 'refresh';
  exp: number; // Expiry timestamp in seconds
};

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
        if (credentials == null) {
          return null;
        }
        const { username, password } = credentials;
        const { data, error } = await apiClient.POST('/sign-in', {
          body: {
            username,
            password,
          },
        });

        if (error != null) {
          console.error(`Signin-error`, error);
          return null;
        }
        console.info(`${username} signed in.`);
        return {
          id: data.uuid,
          uuid: data.uuid,
          accessToken: data.accessToken,
          refreshToken: data.refreshToken,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user, trigger, session }) {
      if (user) {
        // Initial sign-in
        token = {
          ...token,
          ...user,
        };
      } else {
        // Check if the access token is expired or expires soon
        const decoded = jwtDecode<DecodedToken>(token.accessToken as string);
        const isExpired = Date.now() >= decoded.exp * 1000 - hours(1); // 1 hour early refresh
        if (isExpired) {
          console.info(`Access token expired. Refreshing token...`);
          try {
            const { data, error } = await apiClient.POST('/refresh-token', {
              body: { refreshToken: token.refreshToken as string },
              headers: {
                Authorization: `Bearer ${token.accessToken}`,
              } satisfies AuthorizationHeader,
            });

            if (error != null) {
              throw new Error('Failed to refresh access token');
            }

            token = {
              ...token,
              accessToken: data.accessToken,
            };
          } catch {
            throw new Error('Token refresh failed');
          }
        }

        if (trigger === 'update') {
          token = {
            ...token,
            ...session, // TODO Validate https://next-auth.js.org/getting-started/client#updating-the-session
          };
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
  },
};

export default NextAuth(authOptions);
