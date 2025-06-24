import Head from 'next/head';
import AlertsViewer from '@/components/AlertsViewer';
import QuizzesOverview from '@/page-components/dashboard/QuizzesOverview';
import { GetServerSideProps, InferGetServerSidePropsType } from 'next';
import { dehydrate, QueryClient } from '@tanstack/react-query';
import { GetQuizzesRequestQuery, throwOnError } from '@/api-client';
import { fetchQuizzes } from '@/data/useQuizzesQuery';
import Box from '@mui/material/Box';
import { getMessages } from '@/utilities/getMessages';
import { useTranslations } from 'next-intl';
import { canonicalUrl, SeoMeta } from '../../types/seo';

export const getServerSideProps: GetServerSideProps<SeoMeta> = async (ctx) => {
  const messagesPromise = getMessages(ctx.locale, ['dashboard']);

  const queryClient = new QueryClient();
  const defaultQueryParams: GetQuizzesRequestQuery = {
    page: 0,
    pageSize: 12,
    sortOption: 'createdAt',
    sortDirection: 'desc',
  };
  const prefetchPromise = queryClient.prefetchInfiniteQuery({
    queryKey: ['getQuizzesInfinite', defaultQueryParams.sortOption, defaultQueryParams.sortDirection],
    queryFn: async () => throwOnError(() => fetchQuizzes(defaultQueryParams)),
    initialPageParam: 0,
  });

  const [messages] = await Promise.all([messagesPromise, prefetchPromise]);

  return {
    props: {
      messages,
      dehydratedState: dehydrate(queryClient),
      canonicalUrl: canonicalUrl('', ctx.locale),
    },
  };
};

export default function DashboardPage({ canonicalUrl }: InferGetServerSidePropsType<typeof getServerSideProps>) {
  const t = useTranslations('dashboard');

  return (
    <>
      <Head>
        <title>{t('meta.title')}</title>
        <meta name="description" content={t('meta.description')} />
        <meta name="robots" content="index,follow" />
        <meta property="og:title" content={t('meta.og.title')} />
        <meta property="og:description" content={t('meta.og.description')} />
        <meta property="og:image" content="public/favicion" />
        <link rel="canonical" href={canonicalUrl} />
      </Head>
      <Box sx={{ marginTop: 2 }}>
        <AlertsViewer />
        <QuizzesOverview />
      </Box>
    </>
  );
}
