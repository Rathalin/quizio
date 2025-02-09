import { throwOnError } from '@/api-client';
import GenericLoadingErrorMessage from '@/components/GenericLoadingErrorMessage';
import GradientText from '@/components/GradientText';
import { QuizioBreadcrumbs } from '@/components/breadcrumbs/QuizioBreadcrumbs';
import { ProfileAvatar } from '@/components/users/ProfileAvatar';
import UserProfilePlaceholder from '@/components/users/UserProfilePlaceholder';
import UserStats from '@/components/users/UserStats';
import { fetchUserProfile, useUserProfileQuery } from '@/data/useUserProfileQuery';
import { getMessages } from '@/utilities/getMessages';
import { quizioTitle } from '@/utilities/quizioTitle';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import { dehydrate, QueryClient } from '@tanstack/react-query';
import { GetServerSideProps, InferGetServerSidePropsType } from 'next';
import { useSession } from 'next-auth/react';
import { useTranslations } from 'next-intl';
import Head from 'next/head';
import Link from 'next/link';

export const getServerSideProps: GetServerSideProps<{
  uuid: string;
}> = async (ctx) => {
  const uuid = ctx.params?.uuid;
  if (typeof uuid != 'string') {
    return {
      notFound: true,
    };
  }

  const messagesPromise = getMessages(ctx.locale, ['users', 'myProfile']);

  const queryClient = new QueryClient();
  const prefetchPromise = queryClient.prefetchQuery({
    queryKey: ['getUserProfile', uuid],
    queryFn: () => throwOnError(() => fetchUserProfile(uuid)),
  });

  const [messages] = await Promise.all([messagesPromise, prefetchPromise]);

  return {
    props: {
      uuid,
      messages,
      dehydratedState: dehydrate(queryClient),
    },
  };
};

export default function UserIdPage({ uuid }: InferGetServerSidePropsType<typeof getServerSideProps>) {
  const t = useTranslations('users');
  const { data: session } = useSession();
  const { data, isPending, isSuccess, isError } = useUserProfileQuery(uuid);

  return (
    <>
      <Head>
        <title>{quizioTitle(t('profile.meta.title', { username: data?.user.username ?? '' }))}</title>
      </Head>
      <Box>
        <QuizioBreadcrumbs>
          <Link href="/users/me" aria-current="page">
            {isSuccess ? `${t('breadcrumbs.current')}: ${data.user.username}` : t('breadcrumbs.current')}
          </Link>
        </QuizioBreadcrumbs>
        <Box sx={{ marginTop: 2 }}>
          <Card elevation={2} sx={{ paddingBottom: 2 }}>
            <CardContent sx={{ padding: 4 }}>
              {isPending && <UserProfilePlaceholder />}
              {isSuccess && (
                <>
                  <Typography variant="h1">
                    <GradientText>{data.user.username}</GradientText>
                  </Typography>
                  {session?.user.uuid === data.user.uuid && (
                    <Typography sx={{ marginTop: 2 }}>
                      <Link href="/users/me">{t('link.toMyProfileSettings')}</Link>
                    </Typography>
                  )}
                  <Box sx={{ marginTop: 4 }}>
                    <Box sx={{ marginBottom: 6 }}>
                      <ProfileAvatar imageUrl={data.user.profileImageUrl} username={data.user.username} />
                    </Box>
                    <UserStats
                      username={data.user.username}
                      createdAt={new Date(data.user.createdAt)}
                      quizCount={data.quizStats.totalQuizzesCreated}
                      quizViewsTotal={data.quizStats.totalQuizzesPlayCount}
                    />
                  </Box>
                </>
              )}
              {isError && <GenericLoadingErrorMessage />}
            </CardContent>
          </Card>
        </Box>
      </Box>
    </>
  );
}
