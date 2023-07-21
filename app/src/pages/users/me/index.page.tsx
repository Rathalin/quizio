import GenericLoadingErrorMessage from '@/components/GenericLoadingErrorMessage';
import HomeButton from '@/components/buttons/HomeButton';
import { useAuthHeader } from '@/custom-hooks/useAuthHeader';
import { useHandleGqlUnauthorized } from '@/custom-hooks/useHandleGqlUnauthorized';
import { useRedirectOnUnauthenticated } from '@/custom-hooks/useRedirectOnUnauthenticated';
import { getMeGQL } from '@/graphql/users';
import MyProfile from '@/page-components/user/me/MyProfile';
import MyProfilePlaceholder from '@/page-components/user/me/MyProfilePlaceholder';
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

export default function MePage() {
  const { status } = useSession();
  const { authHeader } = useAuthHeader();

  const { isLoading, isError, error, isSuccess, data } = useQuery({
    queryKey: ['me'],
    queryFn: () =>
      request(process.env.NEXT_PUBLIC_GRAPHQL_URL, getMeGQL, {}, authHeader),
    enabled: status === 'authenticated',
  });

  useHandleGqlUnauthorized([error]);
  useRedirectOnUnauthenticated(status);

  const username = data?.me?.username ?? '';
  const email = data?.me?.email ?? '';
  const role = data?.me?.role?.name ?? '';

  return (
    <Box sx={{ marginTop: 4 }}>
      <Card elevation={2}>
        <CardContent sx={{ padding: 4 }}>
          <Typography variant="h1" sx={{ marginTop: 0 }}>
            Your profile
          </Typography>
          {isLoading && <MyProfilePlaceholder />}
          {isSuccess && (
            <MyProfile username={username} email={email} role={role} />
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
