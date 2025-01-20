import { Typography, Stack, Divider, Box } from '@mui/material';
import { useMemo } from 'react';
import { ProfileAvatar } from './ProfileAvatar';

type UserProfileProps = {
  username: string;
  createdAt: Date;
  quizCount: number;
  quizViewsTotal: number;
  imageUrl: string | null;
};

export default function UserProfile({
  username,
  createdAt,
  quizCount,
  quizViewsTotal,
  imageUrl,
}: UserProfileProps) {
  const dateFormat = useMemo(
    () => new Intl.DateTimeFormat('en-GB', { dateStyle: 'short' }),
    []
  );

  return (
    <>
      <Box sx={{ marginBottom: 4 }}>
        <ProfileAvatar imageUrl={imageUrl} username={username} />
      </Box>
      <Stack spacing={1} alignItems="start">
        <Typography variant="h1" sx={{ marginTop: 0 }}>
          {username}
        </Typography>
        <Typography>{`Joined on ${dateFormat.format(
          new Date(createdAt)
        )}`}</Typography>
        <Divider />
        {/* TODO Fix this mess with translations */}
        <Typography>{`Created ${quizCount} quiz${
          quizCount === 1 ? '' : 'zes'
        } which ${
          quizCount === 1 ? 'has' : 'have'
        } been played a total of ${quizViewsTotal} time${
          quizViewsTotal === 1 ? '' : 's'
        }.`}</Typography>
      </Stack>
    </>
  );
}
