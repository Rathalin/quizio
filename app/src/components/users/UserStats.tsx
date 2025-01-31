import { ProfileAvatar } from './ProfileAvatar';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Divider from '@mui/material/Divider';
import { dateFormatter } from '@/utilities/intlFormats';
import { useTranslations } from 'next-intl';

type UserProfileProps = {
  username: string;
  createdAt: Date;
  quizCount: number;
  quizViewsTotal: number;
};

export default function UserStats({ username, createdAt, quizCount, quizViewsTotal }: UserProfileProps) {
  const t = useTranslations('myProfile.stats');
  return (
    <>
      <Box sx={{ marginBottom: 4 }}>
        <ProfileAvatar />
      </Box>
      <Typography variant="h3" component="h2" sx={{ marginBottom: 4 }}>
        {t('heading')}
      </Typography>
      <Stack spacing={1} alignItems="start">
        <Typography>
          {t('joinedOn', {
            username,
            date: dateFormatter.format(new Date(createdAt)),
          })}
        </Typography>
        <Divider />
        {/* TODO Fix this mess with translations */}
        <Typography>{`Created ${quizCount} quiz${quizCount === 1 ? '' : 'zes'} which ${
          quizCount === 1 ? 'has' : 'have'
        } been played a total of ${quizViewsTotal} time${quizViewsTotal === 1 ? '' : 's'}.`}</Typography>
      </Stack>
    </>
  );
}
