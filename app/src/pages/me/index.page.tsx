import LinkButton from '@/components/LinkButton';
import { getMeGQL } from '@/graphql/user';
import MeDataPlaceholder from '@/page-components/me/MeDataPlaceholder';
import MeImagePlaceholder from '@/page-components/me/MeImagePlaceholder';
import {
  Alert,
  Avatar,
  Box,
  Card,
  CardActions,
  CardContent,
  Stack,
  Tooltip,
  Typography,
  useTheme,
} from '@mui/material';
import { useQuery } from '@tanstack/react-query';
import request from 'graphql-request';
import { useSession } from 'next-auth/react';

export default function MePage() {
  const theme = useTheme();
  const { data: session, status } = useSession();
  const { isLoading, isError, error, isSuccess, data } = useQuery({
    queryKey: ['me'],
    queryFn: () =>
      request(
        process.env.NEXT_PUBLIC_GRAPHQL_URL,
        getMeGQL,
        {},
        {
          Authorization: `Bearer ${session?.user.acessToken}`,
        }
      ),
    enabled: status === 'authenticated',
  });

  const initials = data?.me?.username?.trim().charAt(0).toUpperCase() ?? '';

  return (
    <Box sx={{ marginTop: 4 }}>
      <Card elevation={2}>
        <CardContent sx={{ padding: 4 }}>
          <Typography variant="h1" sx={{ marginTop: 0 }}>
            Profile
          </Typography>
          <Stack
            direction="row"
            justifyContent="space-between"
            flexWrap="wrap"
            gap={4}
          >
            {isLoading && (
              <>
                <MeDataPlaceholder />
                <MeImagePlaceholder />
              </>
            )}
            {isSuccess && (
              <>
                <Stack spacing={1} alignItems="start">
                  <Tooltip title="Your username" placement="right-start" arrow>
                    <Typography>{data.me?.username}</Typography>
                  </Tooltip>
                  <Tooltip
                    title="Your email address"
                    placement="right-start"
                    arrow
                  >
                    <Typography>{data.me?.email}</Typography>
                  </Tooltip>
                  <Tooltip title="Your role" placement="right-start" arrow>
                    <Typography>{data.me?.role?.name}</Typography>
                  </Tooltip>
                </Stack>
                <Stack alignItems="center" spacing={1}>
                  <Avatar
                    variant="rounded"
                    sx={{
                      backgroundColor: theme.palette.primary.dark,
                      fontWeight: 'bold',
                      width: '6rem',
                      height: '6rem',
                      fontSize: '2rem',
                      color: theme.palette.primary.contrastText,
                    }}
                  >
                    {initials}
                  </Avatar>
                  <Typography>Profile image comming soon.</Typography>
                </Stack>
              </>
            )}
            {isError && (
              <Alert severity="error">Could not load your profile data.</Alert>
            )}
          </Stack>
        </CardContent>
        <CardActions sx={{ padding: 4 }}>
          <Stack
            direction="column"
            justifyContent="space-between"
            gap={2}
            sx={{ marginTop: 4 }}
          >
            <LinkButton
              hrefObserver="/"
              navigateOnClick
              variant="outlined"
              iconSide="right"
            >
              Home
            </LinkButton>
          </Stack>
        </CardActions>
      </Card>
    </Box>
  );
}
