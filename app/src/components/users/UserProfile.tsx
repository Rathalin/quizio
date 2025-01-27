import { ProfileAvatar } from './ProfileAvatar';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Divider from '@mui/material/Divider';
import { useSession } from 'next-auth/react';
import { dateFormatter } from '@/utilities/intlFormats';

type UserProfileProps = {
  createdAt: Date;
  quizCount: number;
  quizViewsTotal: number;
};

export default function UserProfile({ createdAt, quizCount, quizViewsTotal }: UserProfileProps) {
  const { data: session } = useSession();

  return (
    <>
      <Box sx={{ marginBottom: 4 }}>
        <ProfileAvatar />
      </Box>
      <Stack spacing={1} alignItems="start">
        <Typography variant="h1" sx={{ marginTop: 0 }}>
          {session?.user.username}
        </Typography>
        <Typography>{`Joined on ${dateFormatter.format(new Date(createdAt))}`}</Typography>
        <Divider />
        {/* TODO Fix this mess with translations */}
        <Typography>{`Created ${quizCount} quiz${quizCount === 1 ? '' : 'zes'} which ${
          quizCount === 1 ? 'has' : 'have'
        } been played a total of ${quizViewsTotal} time${quizViewsTotal === 1 ? '' : 's'}.`}</Typography>
      </Stack>
    </>
  );
}
