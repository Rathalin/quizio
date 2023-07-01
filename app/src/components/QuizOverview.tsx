import {
  Alert,
  Box,
  Card,
  CardContent,
  Chip,
  IconButton,
  Snackbar,
  Stack,
  Tooltip,
  Typography,
  darken,
  lighten,
  useTheme,
} from '@mui/material';
import Image from 'next/image';
import {
  BarChart as BarChartIcon,
  Edit as EditIcon,
  Image as ImageIcon,
  PlayArrow as PlayArrowIcon,
  Share as ShareIcon,
} from '@mui/icons-material';
import LinkButton from './LinkButton';
import { useMemo, useState } from 'react';
import LinkIconButton from './LinkIconButton';
import { useColorMode } from '@/page-components/theme.context';

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
  const { mode } = useColorMode();
  const isQuestionCountSingular = questionCount === 1;
  const [showCopiedAlert, setShowCopiedAlert] = useState(false);

  const dateFormat = useMemo(
    () => new Intl.DateTimeFormat('en-GB', { dateStyle: 'short' }),
    []
  );

  const copiedText = useMemo(() => {
    const titleLimit = 30;
    return title.length > titleLimit
      ? `${title.slice(0, titleLimit)}...`
      : title;
  }, [title]);

  function handleShareClick() {
    navigator.clipboard.writeText(`${window.location.origin}/play/${uuid}`);
    setShowCopiedAlert(true);
  }

  function handleCopiedAlertClose(_event: unknown, reason?: string) {
    if (reason === 'clickaway') {
      return;
    }
    setShowCopiedAlert(false);
  }
  return (
    <>
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
            src={`${process.env.NEXT_PUBLIC_BACKEND_URL}${imageUrl}`}
            alt="QuizImage"
            width={300}
            height={200}
            style={{
              objectFit: 'cover',
              width: '100%',
              minHeight: '180px',
              filter: mode === 'light' ? 'opacity(0.8)' : 'none',
            }}
            priority
            unoptimized
          ></Image>
        ) : (
          <Box
            sx={{
              minHeight: '180px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor:
                mode === 'light'
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
                <Stack direction="row" alignItems="center">
                  <Tooltip title="Copy link" arrow>
                    <IconButton onClick={() => handleShareClick()}>
                      <ShareIcon color="secondary" />
                    </IconButton>
                  </Tooltip>
                  {isMyQuiz && (
                    <Tooltip title="Edit your quiz" arrow>
                      <Box>
                        <LinkIconButton
                          hrefObserver={`/quiz/edit/${uuid}`}
                          navigateOnClick
                        >
                          <EditIcon color="secondary" />
                        </LinkIconButton>
                      </Box>
                    </Tooltip>
                  )}
                </Stack>
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
              iconSide="left"
            >
              Play
            </LinkButton>
          </Box>
        </CardContent>
      </Card>
    </>
  );
}
