import { throwOnError } from '@/api-client';
import { getMessages } from '@/utilities/getMessages';
import { quizioTitle } from '@/utilities/quizioTitle';
import { dehydrate, QueryClient } from '@tanstack/react-query';
import { GetServerSideProps, InferGetServerSidePropsType } from 'next';
import { getServerSession } from 'next-auth';
import { useTranslations } from 'next-intl';
import Head from 'next/head';
import { fetchMyQuizTrends, useMyQuizTrendsQuery } from '@/data/useMyQuizTrendsQuery';
import { authOptions } from '@/pages/api/auth/[...nextauth].page';
import { QuizioBreadcrumbs } from '@/components/breadcrumbs/QuizioBreadcrumbs';
import Link from 'next/link';
import Typography from '@mui/material/Typography';
import GradientText from '@/components/GradientText';
import { TrendPreview } from '../../TrendPreview';
import { useDateFormatter } from '@/utilities/useDateFormatter';

export const getServerSideProps: GetServerSideProps<{ uuid: string }> = async (ctx) => {
  const uuid = ctx.params?.uuid;
  if (typeof uuid !== 'string') {
    return {
      notFound: true
    };
  }

  const messagesPromise = getMessages(ctx.locale, ['myQuizzesTrends']);

  const session = await getServerSession(ctx.req, ctx.res, authOptions);
  const queryClient = new QueryClient();
  const prefetchPromise = queryClient.prefetchQuery({
    queryKey: ['getMyQuizTrends', uuid],
    queryFn: () =>
      throwOnError(() =>
        fetchMyQuizTrends(uuid, {
          Authorization: `Bearer ${session?.user.accessToken}`
        })
      )
  });

  const [messages] = await Promise.all([messagesPromise, prefetchPromise]);

  return {
    props: {
      uuid,
      messages,
      dehydratedState: dehydrate(queryClient)
    }
  };
};

export default function MyQuizzesPage({ uuid }: InferGetServerSidePropsType<typeof getServerSideProps>) {
  const t = useTranslations('myQuizzesTrends');
  const dateFormatter = useDateFormatter();

  const { data: quiz } = useMyQuizTrendsQuery(uuid);

  return (
    <>
      <Head>
        <title>{quizioTitle(t('meta.title'))}</title>
      </Head>

      <QuizioBreadcrumbs>
        <Link href={'/my-quizzes'}>{t('breadcrumbs.myQuizzes')}</Link>
        <Link href={`/quiz/edit/${uuid}`}>
          {quiz != null
            ? t('breadcrumbs.edit.current.withTitle', { title: quiz.title })
            : t('breadcrumbs.edit.current.withoutTitle')}
        </Link>
      </QuizioBreadcrumbs>
      <Typography
        variant="h3"
        component="h1"
        sx={{
          marginTop: 2,
          marginBottom: 2
        }}
      >
        {t.rich('heading', {
          gradient: (chunks) => <GradientText>{chunks}</GradientText>
        })}
      </Typography>
      {quiz != null && (
        <>
          <Typography>{t('text', { count: quiz.playProtocolStatistic.entriesPerDay.length })}</Typography>
          <Typography color="textSecondary">
            {t('migratedInfo', {
              migrationDate: dateFormatter.format(new Date(quiz.playProtocolStatistic.migrationDate))
            })}
          </Typography>
          <TrendPreview quizUuid={uuid} statistic={quiz.playProtocolStatistic} />
        </>
      )}
    </>
  );
}
