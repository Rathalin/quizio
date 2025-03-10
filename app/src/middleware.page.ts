import { NextRequestWithAuth, withAuth } from 'next-auth/middleware';
import { NextFetchEvent } from 'next/server';

export default function middleware(req: NextRequestWithAuth, res: NextFetchEvent) {
  const locale = req.nextUrl.locale ?? 'de';

  return withAuth({
    pages: {
      signIn: `/${locale}/auth/signin`,
    },
  })(req, res);
}

export const config = {
  matcher: [
    '/users/me',
    '/users/me/change-password',
    '/my-quizzes',
    '/quiz/my-quizzes/:path/trends',
    '/quiz/create',
    '/quiz/edit/:path',
    '/quiz/my-quizzes/:path/trends',
  ],
};
