import GenericLoadingErrorMessage from '@/components/GenericLoadingErrorMessage';
import HomeButton from '@/components/buttons/HomeButton';
import UserProfile from '@/components/users/UserProfile';
import { useMyUserProfileQuery } from '@/data/useMyUserProfileQuery';
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

export default function MePage() {
  const { data, isPending, isError, isSuccess } = useMyUserProfileQuery();

  return (
    <Box sx={{ marginTop: 4 }}>
      <Card elevation={2}>
        <CardContent sx={{ padding: 4 }}>
          <Typography variant="h1" sx={{ marginTop: 0 }}>
            Your profile
          </Typography>
          {isPending && <MyProfilePlaceholder />}
          {isSuccess && (
            <>
              <Box sx={{ marginBottom: 4 }}>
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
              </Box>
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
