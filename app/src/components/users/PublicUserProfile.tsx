import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Divider from '@mui/material/Divider';
import { PublicProfileAvatar } from './PublicProfileAvatar';
import { dateFormatter } from '@/utilities/intlFormats';

type Props = {
  username: string;
  createdAt: Date;
  quizCount: number;
  quizViewsTotal: number;
  imageUrl: string | null;
};

export default function PublicUserProfile({ username, createdAt, quizCount, quizViewsTotal, imageUrl }: Props) {
  return (
    <>
      <Box sx={{ marginBottom: 6 }}>
        <PublicProfileAvatar imageUrl={imageUrl} username={username} />
      </Box>
      <Typography variant="h3" component="h2" sx={{ marginBottom: 4 }}>
        {'Stats'}
      </Typography>
      <Stack spacing={1} alignItems="start">
        <Typography>{`Joined on ${dateFormatter.format(new Date(createdAt))}.`}</Typography>
        <Divider />
        {/* TODO Fix this mess with translations */}
        <Typography>{`Created ${quizCount} quiz${quizCount === 1 ? '' : 'zes'} which ${
          quizCount === 1 ? 'has' : 'have'
        } been played a total of ${quizViewsTotal} time${quizViewsTotal === 1 ? '' : 's'}.`}</Typography>
      </Stack>
    </>
  );
}
