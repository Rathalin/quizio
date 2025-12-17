import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Chip from '@mui/material/Chip';
import IconButton from '@mui/material/IconButton';
import Stack from '@mui/material/Stack';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import { darken, lighten, useColorScheme, useTheme } from '@mui/material/styles';
import Image from 'next/image';
import ImageIcon from '@mui/icons-material/Image';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import ShareIcon from '@mui/icons-material/Share';
import LinkButton from './LinkButton';
import { useMemo } from 'react';
import Link from 'next/link';
import { usePageTransition } from '@/persistence/page-transition.store';
import LoadingCircle from './LoadingCircle';
import { prefixWithBackendUrl } from '@/utilities/urlUtils';
import { useToastStore } from '@/persistence/taost.store';
import { useTranslations } from 'next-intl';
import { useDateFormatter } from '@/utilities/useDateFormatter';
import { Route } from 'next';

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
}: QuizOverviewCardProps) {
  const t = useTranslations('dashboard.quizCard');
  const theme = useTheme();
  const { mode } = useColorScheme();
  const { showInfoToast } = useToastStore();
  const { transitionHref } = usePageTransition();
  const dateFormatter = useDateFormatter();

  const copiedText = useMemo(() => {
    const titleLimit = 30;
    const shortTitle = title.length > titleLimit ? `${title.slice(0, titleLimit)}...` : title;

    return t('share.toast', { title: shortTitle });
  }, [t, title]);

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
                  ? lighten(theme.palette.secondary.light, 0.7)
                  : darken(theme.palette.secondary.light, 0.7),
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
                  marginTop: 1,
                  marginBottom: {
                    xs: 2,
                    md: 3,
                  },
                  display: 'flex',
                  alignItems: 'start',
                  justifyContent: 'space-between',
                }}
              >
                <Box
                  sx={{
                    flex: 1,
                    overflowWrap: 'anywhere',
                  }}
                >
                  {title}
                </Box>
                <Stack direction="row" alignItems="center">
                  <Tooltip title={t('share.tooltip')} arrow>
                    <IconButton onClick={() => handleShareClick()}>
                      <ShareIcon color="secondary" />
                    </IconButton>
                  </Tooltip>
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
                <Chip label={t('questionCount', { count: questionCount })} variant="outlined" />
                <Chip label={t('playCount', { count: playCount })} variant="outlined" />
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
              hrefObserver={`/play/${uuid}` as Route}
              navigateOnClick
              variant="contained"
              size="large"
              endIcon={<PlayArrowIcon />}
              iconSide="left"
            >
              {t('button.play.label')}
            </LinkButton>
          </Box>
        </CardContent>
      </Card>
    </>
  );
}
