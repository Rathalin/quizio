import { useDateFormatter } from '@/utilities/useDateFormatter';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { useTranslations } from 'next-intl';

type UserProfileProps = {
  username: string;
  createdAt: Date;
  quizCount: number;
  quizViewsTotal: number;
};

export default function UserStats({ createdAt, quizCount, quizViewsTotal }: UserProfileProps) {
  const t = useTranslations('users.stats');
  const dateFormatter = useDateFormatter();

  return (
    <>
      <Typography
        variant="h3"
        component="h2"
        sx={{
          marginTop: 1,
          marginBottom: 2
        }}
      >
        {t('heading')}
      </Typography>
      <Stack spacing={1} alignItems="start">
        <Stack direction="row" columnGap={10} rowGap={4} flexWrap="wrap">
          <Stack justifyContent="space-between">
            <Typography variant="overline" color="textSecondary">
              {t('joinedAt.label')}
            </Typography>
            <Typography variant="h3" component="div">
              {dateFormatter.format(new Date(createdAt))}
            </Typography>
          </Stack>

          <Stack justifyContent="space-between">
            <Typography variant="overline" color="textSecondary">
              {t('created.label')}
            </Typography>
            <Typography variant="h1" component="div" sx={{ lineHeight: 1 }}>
              {quizCount}
            </Typography>
          </Stack>

          <Stack justifyContent="space-between">
            <Typography variant="overline" color="textSecondary">
              {t('totalPlayCount.label')}
            </Typography>
            <Typography variant="h1" component="div" sx={{ lineHeight: 1 }}>
              {quizViewsTotal}
            </Typography>
          </Stack>
        </Stack>
      </Stack>
    </>
  );
}
