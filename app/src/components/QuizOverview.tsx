import {
  Alert,
  Box,
  Card,
  CardContent,
  Chip,
  IconButton,
  Snackbar,
  Tooltip,
  Typography,
  darken,
  lighten,
  useTheme,
} from '@mui/material';
import Image from 'next/image';
import {
  BarChart as BarChartIcon,
  Image as ImageIcon,
  PlayArrow as PlayArrowIcon,
  Share as ShareIcon,
} from '@mui/icons-material';
import LinkButton from './LinkButton';
import { useMemo, useState } from 'react';
import { usePrefersLightMode } from '@/custom-hooks/usePrefersLightMode';

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
  const prefersLightMode = usePrefersLightMode();
  const isQuestionCountSingular = questionCount === 1;
  const [copiedText, setCopiedText] = useState<string | null>(null);
  const showCopiedAlert = copiedText != null;

  const dateFormat = useMemo(
    () => new Intl.DateTimeFormat('en-GB', { dateStyle: 'short' }),
    []
  );

  function handleShareClick() {
    navigator.clipboard.writeText(`${window.location.origin}/play/${uuid}`);
    const titleLimit = 30;
    const titleText =
      title.length > titleLimit ? `${title.slice(0, titleLimit)}...` : title;
    setCopiedText(`Copied link to '${titleText}'`);
  }

  function handleCopiedAlertClose(_event: unknown, reason?: string) {
    if (reason === 'clickaway') {
      return;
    }
    setCopiedText(null);
  }
  return (
    <>
      {/* TODO: Move to QuizzesOverview.tsx */}
      <Snackbar
        open={showCopiedAlert}
        anchorOrigin={{ horizontal: 'center', vertical: 'bottom' }}
        autoHideDuration={2000}
        onClose={handleCopiedAlertClose}
      >
        <Alert severity="info" onClose={handleCopiedAlertClose}>
          {copiedText}
        </Alert>
      </Snackbar>
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
            style={{
              objectFit: 'cover',
              width: '100%',
              minHeight: '180px',
              filter: prefersLightMode ? 'opacity(0.8)' : 'none',
            }}
            priority
          ></Image>
        ) : (
          <Box
            sx={{
              minHeight: '180px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: prefersLightMode
                ? lighten(theme.palette.secondary.light, 0.4)
                : darken(theme.palette.secondary.dark, 0.4),
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
            alignItems: 'center',
          }}
        >
          <Box>
            <Box>
              <Typography
                variant="h3"
                component="h2"
                sx={{
                  marginBottom: {
                    xs: 2,
                    md: 3,
                  },
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                }}
              >
                {title}
                <Box>
                  {/* {isMyQuiz && (
                    <Link href={`/quiz/edit/${uuid}`}>
                      <Tooltip title="Edit your quiz" arrow>
                        <IconButton>
                          <EditIcon color="secondary" />
                        </IconButton>
                      </Tooltip>
                    </Link>
                  )} */}
                  <Tooltip title="Copy link" arrow>
                    <IconButton onClick={() => handleShareClick()}>
                      <ShareIcon color="secondary" />
                    </IconButton>
                  </Tooltip>
                </Box>
              </Typography>
            </Box>
            <Box>
              <Typography sx={{ marginBottom: '.8rem' }}>
                {description}
              </Typography>
              <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                <Chip label={username} variant="filled" />
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
    </>
  );
}
