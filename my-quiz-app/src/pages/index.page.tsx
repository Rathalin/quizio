import { Box, Typography } from '@mui/material';
import GradientWord from '@/components/GradientWord';
import QuizzesOverview from '@/page-components/QuizzesOverview';
import AccountMenu from '@/page-components/AccountMenu';
import Link from 'next/link';
import { GetServerSideProps, InferGetServerSidePropsType } from 'next';
import { DehydratedState, QueryClient, dehydrate } from '@tanstack/react-query';
import request from 'graphql-request';
import { queryAllPublishedQuizzes } from '@/graphql/quizzes';

export const getServerSideProps: GetServerSideProps<{
  dehydratedState: DehydratedState;
}> = async () => {
  const queryClient = new QueryClient();

  await queryClient.prefetchQuery(['allPublishedQuizzes'], () =>
    request(process.env.NEXT_PUBLIC_GRAPHQL_URL, queryAllPublishedQuizzes)
  );

  return {
    props: {
      dehydratedState: dehydrate(queryClient),
    },
  };
};

export default function Home({
  dehydratedState,
}: InferGetServerSidePropsType<typeof getServerSideProps>) {
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
