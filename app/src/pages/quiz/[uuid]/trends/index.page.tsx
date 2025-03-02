import { throwOnError } from '@/api-client';
import { getMessages } from '@/utilities/getMessages';
import { quizioTitle } from '@/utilities/quizioTitle';
import { dehydrate, QueryClient } from '@tanstack/react-query';
import { GetServerSideProps } from 'next';
import { getServerSession } from 'next-auth';
import { useTranslations } from 'next-intl';
import Head from 'next/head';
import { fetchMyQuizTrends } from '@/data/useMyQuizTrendsQuery';
import { authOptions } from '@/pages/api/auth/[...nextauth].page';

export const getServerSideProps: GetServerSideProps = async (ctx) => {
  const uuid = ctx.params?.uuid;
  if (typeof uuid !== 'string') {
    return {
      notFound: true,
    };
  }

  const messagesPromise = getMessages(ctx.locale, ['myQuizTrends']);

  const session = await getServerSession(ctx.req, ctx.res, authOptions);
  const queryClient = new QueryClient();
  const prefetchPromise = queryClient.prefetchQuery({
    queryKey: ['getMyQuizTrends', uuid],
    queryFn: () =>
      throwOnError(() =>
        fetchMyQuizTrends(uuid, {
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

  return (
    <>
      <Head>
        <title>{quizioTitle(t('meta.title'))}</title>
      </Head>
    </>
  );
}
