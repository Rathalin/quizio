import GenericLoadingErrorMessage from '@/components/GenericLoadingErrorMessage';
import HomeButton from '@/components/buttons/HomeButton';
import UserProfile from '@/components/users/UserProfile';
import { useAuthHeader } from '@/custom-hooks/useAuthHeader';
import { useHandleGqlUnauthorized } from '@/custom-hooks/useHandleGqlUnauthorized';
import { useRedirectOnUnauthenticated } from '@/custom-hooks/useRedirectOnUnauthenticated';
import { getMeGQL, getUserProfileDataByIdGQL } from '@/graphql/users';
import MyProfile from '@/page-components/user/me/MyProfile';
import MyProfilePlaceholder from '@/page-components/user/me/MyProfilePlaceholder';
import { getBackendImageUrl } from '@/utilities/getImageUrl';
import {
  Box,
  Card,
  CardActions,
  CardContent,
  Stack,
  Typography,
} from '@mui/material';
import { useQuery } from '@tanstack/react-query';
import request from 'graphql-request';
import { useSession } from 'next-auth/react';
import { useMemo } from 'react';

export default function MePage() {
  const { status } = useSession();
  const { authHeader } = useAuthHeader();

  const meQuery = useQuery({
    queryKey: ['me'],
    queryFn: () =>
      request(process.env.NEXT_PUBLIC_GRAPHQL_URL, getMeGQL, {}, authHeader),
    enabled: status === 'authenticated',
  });
  const userId = meQuery.data?.me?.id;
  const profileQuery = useQuery({
    queryKey: ['user', userId],
    queryFn: () =>
      request(process.env.NEXT_PUBLIC_GRAPHQL_URL, getUserProfileDataByIdGQL, {
        userId: userId!,
      }),
    enabled: userId != null,
  });

  const isLoading = meQuery.isLoading || profileQuery.isLoading;
  const isSuccess = meQuery.isSuccess && profileQuery.isSuccess;
  const isError = meQuery.isError || profileQuery.isError;
  const error = meQuery.error ?? profileQuery.error;

  useHandleGqlUnauthorized([error]);
  useRedirectOnUnauthenticated(status);

  const email = meQuery.data?.me?.email ?? '';
  const role = meQuery.data?.me?.role?.name ?? '';
  const profile = profileQuery.data?.usersPermissionsUser?.data;
  const imageUrl = useMemo(() => {
    const url = profile?.attributes?.profileImage?.data?.attributes?.url;
    if (url != null) {
      return getBackendImageUrl(url);
    }
    return null;
  }, [profile?.attributes?.profileImage?.data?.attributes?.url]);

  return (
    <Box sx={{ marginTop: 4 }}>
      <Card elevation={2}>
        <CardContent sx={{ padding: 4 }}>
          <Typography variant="h1" sx={{ marginTop: 0 }}>
            Your profile
          </Typography>
          {isLoading && <MyProfilePlaceholder />}
          {isSuccess && (
            <>
              <Box sx={{ marginBottom: 4 }}>
                <UserProfile
                  username={profile?.attributes?.username ?? ''}
                  createdAt={profile?.attributes?.createdAt ?? new Date()}
                  quizCount={profile?.attributes?.quizzes?.data?.length ?? 0}
                  quizViewsTotal={
                    profile?.attributes?.quizzes?.data
                      .map((quiz) => quiz.attributes?.playCount ?? 0)
                      .reduce((sum, n) => sum + n, 0) ?? 0
                  }
                  imageUrl={imageUrl}
                />
              </Box>
              <MyProfile email={email} role={role} />
            </>
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
