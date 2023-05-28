import {
  Box,
  Card,
  CardContent,
  Chip,
  Typography,
  darken,
  lighten,
  useTheme,
} from '@mui/material';
import PublishStateChip from './PublishStateChip';
import Image from 'next/image';
import {
  BarChart as BarChartIcon,
  Image as ImageIcon,
  PlayArrow as PlayArrowIcon,
} from '@mui/icons-material';
import LinkButton from './LinkButton';
import { useMemo } from 'react';
import { usePrefersDarkMode } from '@/custom-hooks/usePrefersDarkMode';

type QuizOverviewProps = {
  uuid: string;
  title: string;
  description: string;
  username: string;
  createdAt: Date;
  questionCount: number;
  playCount: number;
  published: boolean;
  imageUrl?: string;
  isMyQuiz: boolean;
};

export default function QuizOverview({
  uuid,
  title,
  description,
  username,
  createdAt,
  questionCount,
  playCount,
  published,
  imageUrl,
  isMyQuiz,
}: QuizOverviewProps) {
  const theme = useTheme();
  const prefersDarkMode = usePrefersDarkMode();
  const isQuestionCountSingular = questionCount === 1;

  const dateFormat = useMemo(
    () => new Intl.DateTimeFormat('en-GB', { dateStyle: 'short' }),
    []
  );

  return (
    <Card
      elevation={2}
      sx={{
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {imageUrl != null ? (
        <Image
          loader={({ src, width: _width, quality: _quality }) =>
            `${process.env.NEXT_PUBLIC_BACKEND_URL}${src}`
          }
          src={imageUrl}
          alt="QuizImage"
          width={300}
          height={200}
          style={{ objectFit: 'cover', width: '100%', minHeight: '180px' }}
          priority
        ></Image>
      ) : (
        <Box
          sx={{
            minHeight: '180px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: prefersDarkMode
              ? darken(theme.palette.secondary.dark, 0.4)
              : lighten(theme.palette.secondary.light, 0.4),
          }}
        >
          <ImageIcon fontSize="large" />
        </Box>
      )}
      <CardContent
        sx={{
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
        }}
      >
        <Box>
          <Box>
            <Typography
              variant="h3"
              component="h2"
              sx={{ display: 'flex', justifyContent: 'space-between' }}
            >
              {title}
            </Typography>
          </Box>
          <Box>
            <Typography sx={{ marginBottom: '.8rem' }}>
              {description}
            </Typography>
            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
              {isMyQuiz && (
                <Box sx={{ justifySelf: 'center' }}>
                  <PublishStateChip published={published} />
                </Box>
              )}
              {!isMyQuiz && <Chip label={username} variant="filled" />}
              <Chip
                label={`${questionCount} question${
                  isQuestionCountSingular ? '' : 's'
                }`}
                variant="outlined"
              />
              <Chip
                label={playCount}
                icon={<BarChartIcon fontSize="small" />}
                variant="outlined"
              />
              <Chip label={dateFormat.format(createdAt)} variant="outlined" />
            </Box>
          </Box>
        </Box>
        <Box
          sx={{
            marginTop: 4,
            display: 'flex',
            justifyContent: 'center',
          }}
        >
          <LinkButton
            hrefObserver={`/play/${uuid}`}
            navigateOnClick
            variant="contained"
            size="large"
            endIcon={<PlayArrowIcon />}
          >
            Play
          </LinkButton>
        </Box>
      </CardContent>
    </Card>
  );
}
