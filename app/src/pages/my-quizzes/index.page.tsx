import { GetMyQuizzesRequestQuery, throwOnError } from '@/api-client';
import GradientText from '@/components/GradientText';
import { fetchMyQuizzes, useMyQuizzesQuery } from '@/data/useMyQuizzesQuery';
import { getMessages } from '@/utilities/getMessages';
import { quizioTitle } from '@/utilities/quizioTitle';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { dehydrate, QueryClient } from '@tanstack/react-query';
import { GetServerSideProps } from 'next';
import { getServerSession } from 'next-auth';
import { useTranslations } from 'next-intl';
import Head from 'next/head';
import { authOptions } from '../api/auth/[...nextauth].page';
import { useMemo } from 'react';
import { MyQuizzesTable, MyQuizzesTableSkeleton } from './MyQuizzesTable';
import { QuizioBreadcrumbs } from '@/components/breadcrumbs/QuizioBreadcrumbs';
import Link from 'next/link';
import AddIcon from '@mui/icons-material/Add';
import LinkButton from '@/components/LinkButton';
import useMediaQuery from '@mui/material/useMediaQuery';
import { useTheme } from '@mui/material/styles';
import { MyQuizzesMobileTable } from './MyQuizzesMobileTable';

export const getServerSideProps: GetServerSideProps = async (ctx) => {
  const messagesPromise = getMessages(ctx.locale, ['myQuizzes']);

  const session = await getServerSession(ctx.req, ctx.res, authOptions);
  const queryClient = new QueryClient();
  const defaultQueryParams: GetMyQuizzesRequestQuery = {
    sortOption: 'createdAt',
    sortDirection: 'desc',
  };
  const prefetchPromise = queryClient.prefetchQuery({
    queryKey: ['getMyQuizzes', session?.user.uuid, defaultQueryParams.sortOption, defaultQueryParams.sortDirection],
    queryFn: async () =>
      throwOnError(() =>
        fetchMyQuizzes(defaultQueryParams, {
          Authorization: `Bearer ${session?.user.accessToken}`,
        }),
      ),
  });

  const [messages] = await Promise.all([messagesPromise, prefetchPromise]);

  return {
    props: {
      messages,
      dehydratedState: dehydrate(queryClient),
    },
  };
};

export default function MyQuizzesPage() {
  const t = useTranslations('myQuizzes');
  const theme = useTheme();
  const isMediumScreen = useMediaQuery(theme.breakpoints.down('md'));
  const quizzesMyQueryParams: GetMyQuizzesRequestQuery = {
    sortOption: 'createdAt',
    sortDirection: 'desc',
  };
  const { data, isPending } = useMyQuizzesQuery(quizzesMyQueryParams);
  const quizzes = useMemo(() => data?.quizzes ?? [], [data?.quizzes]);

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
            display: 'flex',
            gap: 2,
            justifyContent: 'space-between',
            alignItems: 'end',
            flexWrap: 'wrap',
          }}
        >
          <Box component="span">
            {t.rich('heading', {
              gradient: (chunks) => <GradientText>{chunks}</GradientText>,
            })}
          </Box>
          <LinkButton hrefObserver="/quiz/create" navigateOnClick variant="outlined" startIcon={<AddIcon />}>
            {t('create.label')}
          </LinkButton>
        </Typography>

        {isPending ? (
          <MyQuizzesTableSkeleton />
        ) : isMediumScreen ? (
          <MyQuizzesMobileTable quizzes={quizzes} />
        ) : (
          <MyQuizzesTable quizzes={quizzes} />
        )}
      </Box>
    </>
  );
}
