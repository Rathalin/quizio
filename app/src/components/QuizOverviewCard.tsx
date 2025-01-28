import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Chip from '@mui/material/Chip';
import IconButton from '@mui/material/IconButton';
import Stack from '@mui/material/Stack';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import { darken, lighten, useTheme } from '@mui/material/styles';

import Image from 'next/image';
import BarChartIcon from '@mui/icons-material/BarChart';
import EditIcon from '@mui/icons-material/Edit';
import ImageIcon from '@mui/icons-material/Image';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import ShareIcon from '@mui/icons-material/Share';
import LinkButton from './LinkButton';
import { useMemo } from 'react';
import LinkIconButton from './LinkIconButton';
import { useColorMode } from '@/page-components/theme.context';
import Link from 'next/link';
import { usePageTransition } from '@/persistence/page-transition.store';
import LoadingCircle from './LoadingCircle';
import { prefixWithBackendUrl } from '@/utilities/urlUtils';
import { useToastStore } from '@/persistence/taost.store';
import { dateFormatter } from '@/utilities/intlFormats';

type QuizOverviewCardProps = {
  uuid: string;
  title: string;
  description: string;
  userUuid: string;
  username: string;
  createdAt: Date;
  questionCount: number;
  playCount: number;
  published: boolean;
  imageUrl: string | null;
  isMyQuiz: boolean;
};

export default function QuizOverviewCard({
  uuid,
  title,
  description,
  userUuid,
  username,
  createdAt,
  questionCount,
  playCount,
  imageUrl,
  isMyQuiz,
}: QuizOverviewCardProps) {
  const theme = useTheme();
  const { mode } = useColorMode();
  const { showInfoToast } = useToastStore();
  const { transitionHref } = usePageTransition();

  const copiedText = useMemo(() => {
    const titleLimit = 30;
    const shortTitle = title.length > titleLimit ? `${title.slice(0, titleLimit)}...` : title;

    return `Link to "${shortTitle}" copied.`;
  }, [title]);

  function handleShareClick() {
    navigator.clipboard.writeText(`${window.location.origin}/play/${uuid}`);
    showInfoToast(copiedText);
  }
  return (
    <>
      <Card
        elevation={2}
        sx={{
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        {imageUrl != null ? (
          <Image
            src={prefixWithBackendUrl(imageUrl)}
            alt="QuizImage"
            width={300}
            height={200}
            style={{
              objectFit: 'cover',
              width: '100%',
              minHeight: '180px',
            }}
            priority
            unoptimized
          />
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
                        <LinkIconButton hrefObserver={`/quiz/edit/${uuid}`} navigateOnClick>
                          <EditIcon color="secondary" />
                        </LinkIconButton>
                      </Box>
                    </Tooltip>
                  )}
                </Stack>
              </Typography>
            </Box>
            <Box>
              <Typography
                sx={{
                  marginBottom: '.8rem',
                  whiteSpace: 'break-spaces',
                  overflow: 'auto',
                  maxHeight: '8rem',
                }}
              >
                {description}
              </Typography>
              <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                <Link href={`/users/${userUuid}`}>
                  <Chip
                    label={
                      <Stack direction="row" alignItems="center" gap={1}>
                        <Box component="span">{username}</Box>
                        {transitionHref === `/users/${userUuid}` && <LoadingCircle />}
                      </Stack>
                    }
                    variant="filled"
                    sx={{
                      cursor: 'pointer',
                      '&:hover': {
                        textDecoration: 'underline',
                      },
                    }}
                  />
                </Link>
                <Chip label={`${questionCount} question${questionCount === 1 ? '' : 's'}`} variant="outlined" />
                <Chip label={playCount} icon={<BarChartIcon fontSize="small" />} variant="outlined" />
                <Chip label={dateFormatter.format(createdAt)} variant="outlined" />
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
