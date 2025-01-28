import { withAuth } from 'next-auth/middleware';

export default withAuth({
  pages: {
    signIn: '/auth/signin',
  },
});

export const config = {
  matcher: ['/users/me', '/users/me/change-password', '/quiz/create', '/quiz/edit/:path'],
};
