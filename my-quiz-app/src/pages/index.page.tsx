import { Box, Button, Grid, Typography } from '@mui/material';
import GradientWord from '@/components/GradientWord';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/router';
import QuizzesOverview from '@/page-components/QuizzesOverview';
import AccountMenu from '@/page-components/AccountMenu';
import Link from 'next/link';
import { GetServerSideProps } from 'next';
import { QueryClient, dehydrate } from '@tanstack/react-query';
import request from 'graphql-request';
import { queryAllPublishedQuizzes } from '@/graphql/quizzes';

export const getServerSideProps: GetServerSideProps = async () => {
  // const queryClient = new QueryClient();

  // await queryClient.prefetchQuery(['allPublishedQuizzes'], () =>
  //   request(process.env.NEXT_PUBLIC_GRAPHQL_URL, queryAllPublishedQuizzes)
  // );

  // return {
  //   props: {
  //     dehydratedState: dehydrate(queryClient),
  //   },
  // };
  return {
    props: {
      foo: 'bar',
    },
  };
};

export default function Home() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const isAuthenticated = status === 'authenticated';

  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center' }}>
        <Link href="/" style={{ textDecoration: 'none' }}>
          <Typography
            component="h1"
            sx={{
              fontSize: '4rem',
              marginBlock: 4,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <GradientWord>Quizio</GradientWord>
          </Typography>
        </Link>
        <Box sx={{ marginLeft: 'auto' }}>
          <AccountMenu />
        </Box>
      </Box>
      <QuizzesOverview />
    </Box>
  );
}
