import Head from 'next/head';
import { useRouter } from 'next/router';
import AlertsViewer from '@/components/AlertsViewer';
import InvalidTokenAlert from '@/page-components/dashboard/InvalidTokenAlert';
import QuizzesOverview from '@/page-components/dashboard/QuizzesOverview';
import { GetServerSideProps } from 'next';
import { dehydrate, QueryClient } from '@tanstack/react-query';
import { GetQuizzesRequestQuery, throwOnError } from '@/api-client';
import { fetchQuizzes } from '@/data/useQuizzesQuery';
import Box from '@mui/material/Box';

export const getServerSideProps: GetServerSideProps = async (ctx) => {
  const queryClient = new QueryClient();
  const defaultQueryParams: GetQuizzesRequestQuery = {
    page: 0,
    pageSize: 12,
    sort: 'createdAt',
    sortDirection: 'desc',
  };
  await queryClient.prefetchInfiniteQuery({
    queryKey: ['getQuizzesInfinite', defaultQueryParams.sort, defaultQueryParams.sortDirection],
    queryFn: async () => throwOnError(() => fetchQuizzes(defaultQueryParams)),
    initialPageParam: 0,
  });

  return {
    props: {
      dehydratedState: dehydrate(queryClient),
    },
  };
};

export default function HomePage() {
  const router = useRouter();

  const showInvalidTokenAlert = router.query.sessionExpired === 'true';

  return (
    <>
      <Head>
        <meta
          name="description"
          content="Quizo is a quiz app that allows you to create and share quizzes with your friends."
        />
        <meta property="og:title" content="Quizio - The modern quizz app" />
        <meta property="og:description" content="Create and share quizzes with your friends." />
        <meta property="og:image" content="public/favicion" />
      </Head>
      <Box sx={{ marginTop: 2 }}>
        <AlertsViewer />
        {showInvalidTokenAlert && <InvalidTokenAlert />}
        <QuizzesOverview />
      </Box>
    </>
  );
}
