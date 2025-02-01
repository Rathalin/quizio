import { QuizioBreadcrumbs } from '@/components/breadcrumbs/QuizioBreadcrumbs';
import GenericLoadingErrorMessage from '@/components/GenericLoadingErrorMessage';
import GradientText from '@/components/GradientText';
import LoadingCircle from '@/components/LoadingCircle';
import { ProfilePictureForm } from '@/components/users/ProfilePictureForm';
import { useUserAccountQuery } from '@/data/useUserAccountQuery';
import MyProfilePlaceholder from '@/page-components/user/me/MyProfilePlaceholder';
import { getMessages } from '@/utilities/getMessages';
import { quizioTitle } from '@/utilities/quizioTitle';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import { GetServerSideProps } from 'next';
import { useSession } from 'next-auth/react';
import { useTranslations } from 'next-intl';
import Head from 'next/head';
import Link from 'next/link';

export const getServerSideProps: GetServerSideProps = async (ctx) => {
  const messages = await getMessages(ctx.locale, ['myProfile', 'users']);

  return {
    props: {
      messages,
    },
  };
};

export default function MePage() {
  const t = useTranslations();
  const { data: session } = useSession();
  const { data: user, isPending, isSuccess, isError } = useUserAccountQuery();

  return (
    <>
      <Head>
        <title>{quizioTitle(t('myProfile.meta.title'))}</title>
      </Head>
      <QuizioBreadcrumbs>
        <Link href="/users/me" aria-current="page">
          {t('myProfile.breadcrumbs.current')}
        </Link>
      </QuizioBreadcrumbs>
      {user == null && <LoadingCircle />}
      {user != null && (
        <Box sx={{ marginTop: 2 }}>
          <Card elevation={2} sx={{ paddingBottom: 2 }}>
            <CardContent sx={{ padding: 4 }}>
              <Typography variant="h1" sx={{ marginBlock: 0 }}>
                <GradientText>{user.username}</GradientText>
              </Typography>
              {session?.user.uuid === user.uuid && (
                <Typography sx={{ marginBottom: 4, marginTop: 2 }}>
                  <Link href={`/users/${session.user.uuid}`}>{t('myProfile.link.toMyPublicProfile')}</Link>
                </Typography>
              )}
              {isPending && <MyProfilePlaceholder />}
              {isSuccess && (
                <>
                  <Box sx={{ marginBottom: 4 }}>
                    <ProfilePictureForm />
                  </Box>
                  <Typography variant="body2">
                    {t.rich('myProfile.changeUsernameRequest', {
                      email: (chunks) => <Link href={`mailto:${t('common.email')}`}>{chunks}</Link>,
                    })}
                  </Typography>
                </>
              )}
              {isError && <GenericLoadingErrorMessage />}
            </CardContent>
          </Card>
        </Box>
      )}
    </>
  );
}
