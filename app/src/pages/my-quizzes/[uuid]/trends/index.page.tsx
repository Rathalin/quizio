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
import { TrendPreview } from './TrendPreview';
import { useDateFormatter } from '@/utilities/useDateFormatter';
import dayjs from 'dayjs';
import Stack from '@mui/material/Stack';
import { useRouter } from 'next/router';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import ToggleButton from '@mui/material/ToggleButton';
import { useMemo } from 'react';

const intervalFilterOptions = ['lastWeek', 'lastMonth', 'lastYear'] as const;
type IntervalFilterOption = (typeof intervalFilterOptions)[number];

export const getServerSideProps: GetServerSideProps<{
  uuid: string;
  interval: IntervalFilterOption | null;
  from: string;
  to: string;
  defaultFrom: string;
  defaultTo: string;
}> = async (ctx) => {
  const { uuid, interval, from, to } = ctx.query;
  if (typeof uuid !== 'string') {
    return {
      notFound: true
    };
  }

  const defaultFrom = dayjs(new Date()).subtract(1, 'month').startOf('day').toISOString();
  const defaultTo = dayjs(new Date()).startOf('day').toISOString();

  let fromDate = defaultFrom;
  if (typeof from === 'string') {
    const fromDayjs = dayjs(from);
    if (fromDayjs.isValid()) {
      fromDate = fromDayjs.toISOString();
    }
  }

  let toDate = defaultTo;
  if (typeof to === 'string') {
    const toDayjs = dayjs(to);
    if (toDayjs.isValid()) {
      toDate = toDayjs.toISOString();
    }
  }

  const messagesPromise = getMessages(ctx.locale, ['myQuizzesTrends']);

  const session = await getServerSession(ctx.req, ctx.res, authOptions);
  const queryClient = new QueryClient();
  const prefetchPromise = queryClient.prefetchQuery({
    queryKey: ['getMyQuizTrends', uuid, fromDate, toDate],
    queryFn: () =>
      throwOnError(() =>
        fetchMyQuizTrends(uuid, fromDate, toDate, {
          Authorization: `Bearer ${session?.user.accessToken}`
        })
      )
  });

  const [messages] = await Promise.all([messagesPromise, prefetchPromise]);

  return {
    props: {
      uuid,
      interval:
        typeof interval === 'string' && intervalFilterOptions.includes(interval)
          ? (interval as IntervalFilterOption)
          : null,
      from: fromDate,
      to: toDate,
      defaultFrom,
      defaultTo,
      messages,
      dehydratedState: dehydrate(queryClient)
    }
  };
};

export default function MyQuizzesPage({
  uuid,
  interval,
  from,
  to,
  defaultFrom,
  defaultTo
}: InferGetServerSidePropsType<typeof getServerSideProps>) {
  const t = useTranslations('myQuizzesTrends');
  const dateFormatter = useDateFormatter();
  const router = useRouter();
  const fromDayjs = useMemo(() => {
    if (interval != null) {
      const today = dayjs(new Date()).startOf('day');
      switch (interval) {
        case 'lastWeek': {
          return today.subtract(6, 'days');
        }
        case 'lastMonth': {
          return today.subtract(29, 'days');
        }
        case 'lastYear': {
          return today.subtract(364, 'days');
        }
        default: {
          interval satisfies never;
        }
      }
    }
    return dayjs(from);
  }, [from, interval]);
  const toDayjs = useMemo(() => {
    if (interval != null) {
      return dayjs(new Date()).startOf('day');
    }
    return dayjs(to);
  }, [interval, to]);
  const { data: quiz } = useMyQuizTrendsQuery(uuid, fromDayjs.toISOString(), toDayjs.toISOString());

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
          <Stack direction="row" gap={2} flexWrap="wrap" marginTop={4} justifyContent="center">
            <ToggleButtonGroup
              value={interval}
              color="primary"
              onChange={(_, nextInterval) =>
                router.replace({
                  query: {
                    uuid,
                    ...(nextInterval != null ? { interval: nextInterval } : {})
                  }
                })
              }
              exclusive
            >
              <ToggleButton value="lastYear">{t('filter.lastYear.label')}</ToggleButton>
              <ToggleButton value="lastMonth">{t('filter.lastMonth.label')}</ToggleButton>
              <ToggleButton value="lastWeek">{t('filter.lastWeek.label')}</ToggleButton>
            </ToggleButtonGroup>
          </Stack>
          <TrendPreview quizUuid={uuid} statistic={quiz.playProtocolStatistic} />
        </>
      )}
    </>
  );
}
