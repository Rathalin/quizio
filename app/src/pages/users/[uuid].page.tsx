import { throwOnError } from '@/api-client';
import GenericLoadingErrorMessage from '@/components/GenericLoadingErrorMessage';
import HomeButton from '@/components/buttons/HomeButton';
import UserProfile from '@/components/users/UserProfile';
import UserProfilePlaceholder from '@/components/users/UserProfilePlaceholder';
import {
  fetchUserProfile,
  useUserProfileQuery,
} from '@/data/useUserProfileQuery';
import { getBackendImageUrl } from '@/utilities/getImageUrl';
import { Box, Card, CardActions, CardContent, Stack } from '@mui/material';
import { dehydrate, QueryClient } from '@tanstack/react-query';
import { GetServerSideProps, InferGetServerSidePropsType } from 'next';

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

export default function UserIdPage({
  uuid,
}: InferGetServerSidePropsType<typeof getServerSideProps>) {
  const { data, isLoading, isSuccess, isError } = useUserProfileQuery(uuid);

  return (
    <Box sx={{ marginTop: 4 }}>
      <Card elevation={2}>
        <CardContent sx={{ padding: 4 }}>
          {isLoading && <UserProfilePlaceholder />}
          {isSuccess && (
            <UserProfile
              username={data.user.username}
              createdAt={new Date(data.user.createdAt)}
              quizCount={data.quizStats.totalQuizzesCreated}
              quizViewsTotal={data.quizStats.totalQuizzesPlayCount}
              imageUrl={
                data.user.profileImageUrl != null
                  ? getBackendImageUrl(data.user.profileImageUrl)
                  : null
              }
            />
          )}
          {isError && <GenericLoadingErrorMessage />}
        </CardContent>
        <CardActions sx={{ padding: 4 }}>
          <Stack
            direction="column"
            justifyContent="space-between"
            gap={2}
            sx={{ marginTop: 4 }}
          >
            <HomeButton />
          </Stack>
        </CardActions>
      </Card>
    </Box>
  );
}
