import GenericLoadingErrorMessage from '@/components/GenericLoadingErrorMessage';
import HomeButton from '@/components/buttons/HomeButton';
import UserProfile from '@/components/users/UserProfile';
import { useMyUserProfileQuery } from '@/data/useMyUserProfileQuery';
import MyProfilePlaceholder from '@/page-components/user/me/MyProfilePlaceholder';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardActions from '@mui/material/CardActions';
import CardContent from '@mui/material/CardContent';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

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
                  createdAt={new Date(data.user.createdAt)}
                  quizCount={data.quizStats.totalQuizzesCreated}
                  quizViewsTotal={data.quizStats.totalQuizzesPlayCount}
                />
              </Box>
            </>
          )}
          {isError && <GenericLoadingErrorMessage />}
        </CardContent>
        <CardActions sx={{ padding: 4 }}>
          <Stack direction="column" justifyContent="space-between" gap={2} sx={{ marginTop: 4 }}>
            <HomeButton />
          </Stack>
        </CardActions>
      </Card>
    </Box>
  );
}
