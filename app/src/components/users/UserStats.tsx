import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { dateFormatter } from '@/utilities/intlFormats';
import { useTranslations } from 'next-intl';

type UserProfileProps = {
  username: string;
  createdAt: Date;
  quizCount: number;
  quizViewsTotal: number;
};

export default function UserStats({ createdAt, quizCount }: UserProfileProps) {
  const t = useTranslations('users.stats');

  return (
    <>
      <Typography variant="h3" component="h2" sx={{ marginBottom: 2 }}>
        {t('heading')}
      </Typography>
      <Stack spacing={1} alignItems="start">
        <Stack direction="row" columnGap={10} rowGap={4} flexWrap="wrap">
          <Stack justifyContent="space-between">
            <Typography variant="overline" color="textSecondary">
              {t('joinedAt.label')}
            </Typography>
            <Typography variant="h3" component="div" sx={{ marginBlock: 0 }}>
              {dateFormatter.format(new Date(createdAt))}
            </Typography>
          </Stack>

          <Stack justifyContent="space-between">
            <Typography variant="overline" color="textSecondary">
              {t('created.label')}
            </Typography>
            <Typography variant="h1" component="div" sx={{ marginBlock: 0, lineHeight: 1 }}>
              {quizCount}
            </Typography>
          </Stack>

          <Stack justifyContent="space-between">
            <Typography variant="overline" color="textSecondary">
              {t('totalPlayCount.label')}
            </Typography>
            <Typography variant="h1" component="div" sx={{ marginBlock: 0, lineHeight: 1 }}>
              {quizCount}
            </Typography>
          </Stack>
        </Stack>
      </Stack>
    </>
  );
}
