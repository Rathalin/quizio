import { getMessages } from '@/utilities/getMessages';
import { GetServerSideProps } from 'next';
import { useTranslations } from 'next-intl';
import Head from 'next/head';

export const getServerSideProps: GetServerSideProps = async (ctx) => {
  const messages = await getMessages(ctx.locale, ['myQuizzes']);

  return {
    props: {
      messages,
    },
  };
};

export default function MyQuizzesPage() {
  const t = useTranslations('myQuizzes');

  return (
    <>
      <Head>
        <title>{t('meta.title')}</title>
      </Head>
    </>
  );
}
