import { throwOnError } from '@/api-client';
import GenericLoadingErrorMessage from '@/components/GenericLoadingErrorMessage';
import GradientText from '@/components/GradientText';
import { QuizioBreadcrumbs } from '@/components/breadcrumbs/QuizioBreadcrumbs';
import PublicUserProfile from '@/components/users/PublicUserProfile';
import UserProfilePlaceholder from '@/components/users/UserProfilePlaceholder';
import { fetchUserProfile, useUserProfileQuery } from '@/data/useUserProfileQuery';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import { dehydrate, QueryClient } from '@tanstack/react-query';
import { GetServerSideProps, InferGetServerSidePropsType } from 'next';
import { useSession } from 'next-auth/react';
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

  const queryClient = new QueryClient();

  await queryClient.prefetchQuery({
    queryKey: ['getUserProfile', uuid],
    queryFn: () => throwOnError(() => fetchUserProfile(uuid)),
  });

  return {
    props: {
      uuid,
      dehydratedState: dehydrate(queryClient),
    },
  };
};

export default function UserIdPage({ uuid }: InferGetServerSidePropsType<typeof getServerSideProps>) {
  const { data: session } = useSession();
  const { data, isPending, isSuccess, isError } = useUserProfileQuery(uuid);

  return (
    <Box>
      <QuizioBreadcrumbs>
        <Link href="/users/me" aria-current="page">
          {isSuccess ? `Profile: ${data.user.username}` : 'Profile'}
        </Link>
      </QuizioBreadcrumbs>
      <Box sx={{ marginTop: 2 }}>
        <Card elevation={2} sx={{ paddingBottom: 2 }}>
          <CardContent sx={{ padding: 4 }}>
            {isPending && <UserProfilePlaceholder />}
            {isSuccess && (
              <>
                <Typography variant="h1" sx={{ marginBlock: 0 }}>
                  <GradientText>{data.user.username}</GradientText>
                </Typography>
                {session?.user.uuid === data?.user.uuid && (
                  <Typography sx={{ marginTop: 2 }}>
                    <Link href="/users/me">{'Go to my profile settings'}</Link>
                  </Typography>
                )}
                <Box sx={{ marginTop: 4 }}>
                  <PublicUserProfile
                    username={data.user.username}
                    createdAt={new Date(data.user.createdAt)}
                    quizCount={data.quizStats.totalQuizzesCreated}
                    quizViewsTotal={data.quizStats.totalQuizzesPlayCount}
                    imageUrl={data.user.profileImageUrl}
                  />
                </Box>
              </>
            )}
            {isError && <GenericLoadingErrorMessage />}
          </CardContent>
        </Card>
      </Box>
    </Box>
  );
}
