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
import QuizOverviewCard from '@/components/QuizOverviewCard';
import QuizOverviewPlaceholder from '@/components/QuizOverviewPlaceholder';
import ScrollObserver from '@/components/ScrollObserver';
import { useSession } from 'next-auth/react';
import { useMemo } from 'react';
import MyQuizCard from './MyQuizCard';

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
  const { data: session } = useSession();
  const placeholderCount = 6;
  const quizzesMyQueryParams: Omit<GetMyQuizzesRequestQuery, 'page'> = {
    pageSize: 12,
    sortOption: 'createdAt',
    sortDirection: 'desc',
  };
  const { data, isSuccess, isPending, fetchNextPage, isFetchingNextPage, hasNextPage } =
    useMyQuizzesInfiniteQuery(quizzesMyQueryParams);
  const quizzes = useMemo(() => data?.pages.map((page) => page.quizzes).flat() ?? [], [data?.pages]);

  return (
    <>
      <Head>
        <title>{quizioTitle(t('meta.title'))}</title>
      </Head>
      <Box>
        <Typography variant="h1" component="h1">
          {t.rich('heading', {
            gradient: (chunks) => <GradientText>{chunks}</GradientText>,
          })}
        </Typography>
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
            columnGap: {
              xs: 6,
            },
            rowGap: {
              xs: 8,
              md: 6,
            },
          }}
        >
          {isSuccess &&
            quizzes.map(({ uuid, createdAt, title, description, imageUrl, playCount, questionCount, isPublished }) => (
              <MyQuizCard
                key={uuid}
                uuid={uuid}
                title={title}
                description={description ?? ''}
                imageUrl={imageUrl}
                createdAt={new Date(createdAt)}
                playCount={playCount}
                questionCount={questionCount}
                published={isPublished}
              />
            ))}
          {(isPending || isFetchingNextPage) &&
            Array.from({ length: placeholderCount }).map((_, index) => <QuizOverviewPlaceholder key={index} />)}
          <Box sx={{ marginTop: 8 }}>
            {hasNextPage && !isFetchingNextPage ? (
              <ScrollObserver
                onIntersect={() => {
                  fetchNextPage();
                }}
              />
            ) : (
              <></>
            )}
          </Box>
        </Box>
      </Box>
    </>
  );
}
