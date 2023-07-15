import GenericLoadingErrorMessage from '@/components/GenericLoadingErrorMessage';
import HomeButton from '@/components/buttons/HomeButton';
import UserProfile from '@/components/users/UserProfile';
import UserProfilePlaceholder from '@/components/users/UserProfilePlaceholder';
import { getUserProfileDataByIdGQL, getUsersByUuidGQL } from '@/graphql/users';
import {
  Box,
  Card,
  CardActions,
  CardContent,
  Stack,
} from '@mui/material';
import { useQuery } from '@tanstack/react-query';
import request from 'graphql-request';
import { GetServerSideProps, InferGetServerSidePropsType } from 'next';

export const getServerSideProps: GetServerSideProps<{
  userId: string | null;
}> = async (ctx) => {
  const uuid = ctx.params?.uuid;
  if (typeof uuid != 'string') {
    return {
      notFound: true,
    };
  }

  try {
    const queryResult = await request(
      process.env.NEXT_PUBLIC_GRAPHQL_URL,
      getUsersByUuidGQL,
      { uuid }
    );
    return {
      props: {
        userId: queryResult.usersPermissionsUsers?.data?.at(0)?.id ?? null,
      },
    };
  } catch (error) {
    return {
      redirect: {
        destination: '/500',
      },
      props: {
        userId: null,
      },
    };
  }
};

export default function UserIdPage({
  userId,
}: InferGetServerSidePropsType<typeof getServerSideProps>) {
  const { data, isLoading, isSuccess, isError } = useQuery({
    queryKey: ['user', userId],
    queryFn: () =>
      request(process.env.NEXT_PUBLIC_GRAPHQL_URL, getUserProfileDataByIdGQL, {
        userId: userId!,
      }),
    enabled: userId != null,
  });

  const user = data?.usersPermissionsUser?.data;
  const createdAt = user?.attributes?.createdAt ?? '';
  const username = user?.attributes?.username ?? '';
  const quizCount = user?.attributes?.quizzes?.data?.length ?? 0;
  const quizViewsTotal =
    user?.attributes?.quizzes?.data
      .map((quiz) => quiz.attributes?.playCount ?? 0)
      .reduce(sum, 0) ?? 0;

  function sum(sum: number, n: number) {
    return sum + n;
  }

  return (
    <Box sx={{ marginTop: 4 }}>
      <Card elevation={2}>
        <CardContent sx={{ padding: 4 }}>
          {isLoading && <UserProfilePlaceholder />}
          {isSuccess && (
            <UserProfile
              username={username}
              createdAt={createdAt}
              quizCount={quizCount}
              quizViewsTotal={quizViewsTotal}
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
