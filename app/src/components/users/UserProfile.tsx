import { Typography, Stack, Avatar, useTheme, Divider } from '@mui/material';
import { useMemo } from 'react';

type UserProfileProps = {
  username: string;
  createdAt: Date;
  quizCount: number;
  quizViewsTotal: number;
};

export default function UserProfile({
  username,
  createdAt,
  quizCount,
  quizViewsTotal,
}: UserProfileProps) {
  const theme = useTheme();

  const initials = username?.trim().charAt(0).toUpperCase() ?? '';

  const dateFormat = useMemo(
    () => new Intl.DateTimeFormat('en-GB', { dateStyle: 'short' }),
    []
  );

  return (
    <>
      <Stack
        direction="row"
        justifyContent="space-between"
        flexWrap="wrap"
        gap={4}
      >
        <Stack spacing={1} alignItems="start">
          <Typography variant="h1" sx={{ marginTop: 0 }}>
            {username}
          </Typography>
          <Typography>{`Joined on ${dateFormat.format(
            new Date(createdAt)
          )}`}</Typography>
          <Divider />
          <Typography>{`You created ${quizCount} quizzes that have been viewed a total of ${quizViewsTotal} times.`}</Typography>
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
      </Stack>
    </>
  );
}
