import { QuizioBreadcrumbs } from '@/components/breadcrumbs/QuizioBreadcrumbs';
import GenericLoadingErrorMessage from '@/components/GenericLoadingErrorMessage';
import GradientText from '@/components/GradientText';
import LoadingCircle from '@/components/LoadingCircle';
import UserStats from '@/components/users/UserStats';
import { useMyUserProfileQuery } from '@/data/useMyUserProfileQuery';
import { useUserAccountQuery } from '@/data/useUserAccountQuery';
import MyProfilePlaceholder from '@/page-components/user/me/MyProfilePlaceholder';
import { getMessages } from '@/utilities/getMessages';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import { GetServerSideProps } from 'next';
import { useSession } from 'next-auth/react';
import { useTranslations } from 'next-intl';
import Link from 'next/link';

export const getServerSideProps: GetServerSideProps = async (ctx) => {
  const messages = await getMessages(ctx.locale, ['myProfile']);

  return {
    props: {
      messages,
    },
  };
};

export default function MePage() {
  const t = useTranslations('myProfile');
  const { data: session } = useSession();
  const { data, isPending, isError, isSuccess } = useMyUserProfileQuery();
  const { data: user } = useUserAccountQuery();

  return (
    <>
      <QuizioBreadcrumbs>
        <Link href="/users/me" aria-current="page">
          {t('breadcrumbs.current')}
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
                  <Link href={`/users/${session.user.uuid}`}>{t('link.toMyPublicProfile')}</Link>
                </Typography>
              )}
              {isPending && <MyProfilePlaceholder />}
              {isSuccess && (
                <>
                  <UserStats
                    username={user.username}
                    createdAt={new Date(data.user.createdAt)}
                    quizCount={data.quizStats.totalQuizzesCreated}
                    quizViewsTotal={data.quizStats.totalQuizzesPlayCount}
                  />
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
