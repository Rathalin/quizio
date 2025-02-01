import Head from 'next/head';
import AlertsViewer from '@/components/AlertsViewer';
import QuizzesOverview from '@/page-components/dashboard/QuizzesOverview';
import { GetServerSideProps } from 'next';
import { dehydrate, QueryClient } from '@tanstack/react-query';
import { GetQuizzesRequestQuery, throwOnError } from '@/api-client';
import { fetchQuizzes } from '@/data/useQuizzesQuery';
import Box from '@mui/material/Box';
import { getMessages } from '@/utilities/getMessages';
import { useTranslations } from 'next-intl';

export const getServerSideProps: GetServerSideProps = async (ctx) => {
  const messagesPromise = getMessages(ctx.locale, ['dashboard']);

  const queryClient = new QueryClient();
  const defaultQueryParams: GetQuizzesRequestQuery = {
    page: 0,
    pageSize: 12,
    sort: 'createdAt',
    sortDirection: 'desc',
  };
  const prefetchPromise = queryClient.prefetchInfiniteQuery({
    queryKey: ['getQuizzesInfinite', defaultQueryParams.sort, defaultQueryParams.sortDirection],
    queryFn: async () => throwOnError(() => fetchQuizzes(defaultQueryParams)),
    initialPageParam: 0,
  });

  const [messages] = await Promise.all([messagesPromise, prefetchPromise]);

  return {
    props: {
      messages,
      dehydratedState: dehydrate(queryClient),
    },
  };
};

export default function DashboardPage() {
  const t = useTranslations('dashboard');

  return (
    <>
      <Head>
        <meta name="description" content={t('meta.description')} />
        <meta property="og:title" content={t('meta.og.title')} />
        <meta property="og:description" content={t('meta.og.description')} />
        <meta property="og:image" content="public/favicion" />
      </Head>
      <Box sx={{ marginTop: 2 }}>
        <AlertsViewer />
        <QuizzesOverview />
      </Box>
    </>
  );
}
