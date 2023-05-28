import { withAuth } from 'next-auth/middleware';

export default withAuth({
  // callbacks: {
  //   authorized({ req, token }) {
  //     return token != null;
  //   },
  // },
});

export const config = { matcher: ['/create'] };
