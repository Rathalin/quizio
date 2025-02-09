import { GetMyQuizzesRequestQuery, throwOnError } from '@/api-client';
import GradientText from '@/components/GradientText';
import { fetchMyQuizzes, useMyQuizzesInfiniteQuery } from '@/data/useMyQuizzesQuery';
import { getMessages } from '@/utilities/getMessages';
import { quizioTitle } from '@/utilities/quizioTitle';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { QueryClient } from '@tanstack/react-query';
import { GetServerSideProps } from 'next';
import { getServerSession } from 'next-auth';
import { useTranslations } from 'next-intl';
import Head from 'next/head';
import { authOptions } from '../api/auth/[...nextauth].page';
import { useMemo } from 'react';
import { MyQuizzesTable } from './MyQuizzesTable';
import { QuizioBreadcrumbs } from '@/components/breadcrumbs/QuizioBreadcrumbs';
import Link from 'next/link';

export const getServerSideProps: GetServerSideProps = async (ctx) => {
  const messagesPromise = getMessages(ctx.locale, ['myQuizzes']);

  const session = await getServerSession(ctx.req, ctx.res, authOptions);
  const queryClient = new QueryClient();
  const defaultQueryParams: GetMyQuizzesRequestQuery = {
    page: 0,
    pageSize: 12,
    sortOption: 'createdAt',
    sortDirection: 'desc',
  };
  const prefetchPromise = queryClient.prefetchInfiniteQuery({
    queryKey: ['getQuizzesInfinite', defaultQueryParams.sortOption, defaultQueryParams.sortDirection],
    queryFn: async () =>
      throwOnError(() =>
        fetchMyQuizzes(defaultQueryParams, {
          Authorization: `Bearer ${session?.user.accessToken}`,
        }),
      ),
    initialPageParam: 0,
  });

  const [messages] = await Promise.all([messagesPromise, prefetchPromise]);

  return {
    props: {
      messages,
    },
  };
};

export default function MyQuizzesPage() {
  const t = useTranslations('myQuizzes');
  const quizzesMyQueryParams: Omit<GetMyQuizzesRequestQuery, 'page'> = {
    pageSize: 12,
    sortOption: 'createdAt',
    sortDirection: 'desc',
  };
  const { data } = useMyQuizzesInfiniteQuery(quizzesMyQueryParams);
  const quizzes = useMemo(() => data?.pages.map((page) => page.quizzes).flat() ?? [], [data?.pages]);

  return (
    <>
      <Head>
        <title>{quizioTitle(t('meta.title'))}</title>
      </Head>
      <Box>
        <QuizioBreadcrumbs>
          <Link href="/my-quizzes" aria-current="page">
            {t('breadcrumbs.current')}
          </Link>
        </QuizioBreadcrumbs>
        <Typography
          variant="h3"
          component="h1"
          sx={{
            marginTop: 1,
            marginBottom: 3,
          }}
        >
          {t.rich('heading', {
            gradient: (chunks) => <GradientText>{chunks}</GradientText>,
          })}
        </Typography>

        <MyQuizzesTable quizzes={quizzes} />
      </Box>
    </>
  );
}
