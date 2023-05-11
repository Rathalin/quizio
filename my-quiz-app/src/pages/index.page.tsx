import { Box, Typography } from '@mui/material';
import GradientWord from '@/components/GradientWord';
import QuizzesOverview from '@/page-components/QuizzesOverview';
import AccountMenu from '@/page-components/AccountMenu';
import Link from 'next/link';
// import { GetServerSideProps } from 'next';
// import { DehydratedState, QueryClient, dehydrate } from '@tanstack/react-query';
// import request from 'graphql-request';
// import { queryAllPublishedQuizzes } from '@/graphql/quizzes';

// export const getServerSideProps: GetServerSideProps<{
//   dehydratedState: DehydratedState;
// }> = async () => {
//   const queryClient = new QueryClient();

//   await queryClient.prefetchQuery(['allPublishedQuizzes'], () =>
//     request(process.env.NEXT_PUBLIC_GRAPHQL_URL, queryAllPublishedQuizzes)
//   );

//   return {
//     props: {
//       dehydratedState: dehydrate(queryClient),
//     },
//   };
// };

export default function Home() {
  return (
    <Box>
      <Typography
        component="h1"
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '4rem',
          marginTop: {
            xs: 0,
            lg: 4,
          },
          marginBottom: 4,
        }}
      >
        <Link href="/" style={{ textDecoration: 'none' }}>
          <GradientWord>Quizio</GradientWord>
        </Link>
        <Box sx={{ marginLeft: 'auto' }}>
          <AccountMenu />
        </Box>
      </Typography>
      <QuizzesOverview />
    </Box>
  );
}
