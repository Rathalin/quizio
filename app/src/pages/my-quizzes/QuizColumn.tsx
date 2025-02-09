import LoadingCircle from '@/components/LoadingCircle';
import { useDeleteQuizMutation } from '@/data/useDeleteQuizMutation';
import { useToastStore } from '@/persistence/taost.store';
import { theme } from '@/theme';
import { prefixWithBackendUrl } from '@/utilities/urlUtils';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import { useQueryClient } from '@tanstack/react-query';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useState } from 'react';
import Image from 'next/image';
import Tooltip from '@mui/material/Tooltip';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import DeleteQuizDialog from './DeleteQuizDialog';
import { darken, lighten } from '@mui/material/styles';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import ImageIcon from '@mui/icons-material/Image';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import { useTranslations } from 'next-intl';
import { useColorMode } from '@/page-components/theme.context';

type Props = {
  uuid: string;
  title: string;
  description: string | null;
  imageUrl: string | null;
  isHovered: boolean;
};

export function QuizColumn({ uuid, title, description, imageUrl, isHovered }: Props) {
  const t = useTranslations('myQuizzes.table');
  const queryClient = useQueryClient();
  const router = useRouter();
  const { mode } = useColorMode();
  const [dialogOpen, setDialogOpen] = useState(false);
  const { showSuccessToast, showErrorToast } = useToastStore();
  const {
    mutateAsync: deleteQuiz,
    isPending: isDeletePending,
    isSuccess: isDeleteSuccess,
  } = useDeleteQuizMutation(uuid);

  const imageSize = {
    width: 112.5,
    height: 75,
  };

  async function onDeleteDialogConfirm() {
    try {
      await deleteQuiz();

      showSuccessToast(t('column.action.delete.success'));
      queryClient.invalidateQueries({ queryKey: ['getQuizzesInfinite'] });
      queryClient.invalidateQueries({ queryKey: ['getMyQuizzes'] });
      setDialogOpen(false);
      await router.push('/my-quizzes');
    } catch (error) {
      showErrorToast(t('column.action.delete.error'));
    }
  }

  return (
    <>
      <DeleteQuizDialog
        open={dialogOpen}
        quizTitle={title}
        onCancel={() => {
          setDialogOpen(false);
        }}
        onConfirm={onDeleteDialogConfirm}
        loading={isDeletePending}
      />
      <Stack direction="row" gap={2} sx={{ width: '100%' }}>
        {imageUrl != null ? (
          <Image
            src={prefixWithBackendUrl(imageUrl)}
            alt={t('column.quiz.image.alt')}
            width={imageSize.width}
            height={imageSize.height}
            style={{
              objectFit: 'cover',
              width: imageSize.width,
              height: imageSize.height,
              minWidth: imageSize.width,
              borderRadius: '4px',
            }}
            priority
            unoptimized
          />
        ) : (
          <Box
            sx={{
              width: imageSize.width,
              height: imageSize.height,
              minWidth: imageSize.width,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: '4px',
              backgroundColor:
                mode === 'light'
                  ? lighten(theme.palette.secondary.light, 0.7)
                  : darken(theme.palette.secondary.light, 0.7),
            }}
          >
            <ImageIcon fontSize="large" />
          </Box>
        )}
        <Stack gap={1} sx={{ maxWidth: '30ch' }}>
          <Typography
            variant="body1"
            color="textPrimary"
            sx={{
              overflow: 'hidden',
              whiteSpace: 'pre',
              textOverflow: 'ellipsis',
            }}
          >
            {title}
          </Typography>
          <Box sx={{ display: 'grid', flex: 1 }}>
            <Stack
              direction="row"
              sx={{
                display: 'hidden',
                gridColumn: 1,
                gridRow: 1,
                visibility: isHovered ? 'visible' : 'hidden',
                alignSelf: 'end',
              }}
            >
              <Tooltip title={t('column.action.edit.tooltip')} enterDelay={500} enterNextDelay={500} arrow>
                <Link href={`/quiz/edit/${uuid}`}>
                  <IconButton color="inherit">
                    <EditIcon fontSize="small" />
                  </IconButton>
                </Link>
              </Tooltip>
              <Tooltip title={t('column.action.delete.tooltip')} enterDelay={500} enterNextDelay={500} arrow>
                <Box>
                  <IconButton
                    color="inherit"
                    onClick={() => {
                      setDialogOpen(true);
                    }}
                    disabled={isDeletePending || isDeleteSuccess}
                  >
                    {isDeletePending ? <LoadingCircle /> : <DeleteIcon fontSize="small" />}
                  </IconButton>
                </Box>
              </Tooltip>
              <Tooltip title={t('column.action.copyLink.tooltip')} enterDelay={500} enterNextDelay={500} arrow>
                <Box>
                  <IconButton color="inherit">
                    <ContentCopyIcon fontSize="small" />
                  </IconButton>
                </Box>
              </Tooltip>
              <Tooltip title={t('column.action.play.tooltip')} enterDelay={500} enterNextDelay={500} arrow>
                <Box>
                  <IconButton color="inherit">
                    <PlayArrowIcon fontSize="small" />
                  </IconButton>
                </Box>
              </Tooltip>
            </Stack>
            <Typography
              variant="body2"
              color="textSecondary"
              sx={{
                overflow: 'hidden',
                whiteSpace: 'pre-line',
                textOverflow: 'ellipsis',
                display: '-webkit-box',
                WebkitBoxOrient: 'vertical',
                WebkitLineClamp: 2,
                gridColumn: 1,
                gridRow: 1,
                visibility: isHovered ? 'hidden' : 'visible',
              }}
            >
              {description}
            </Typography>
          </Box>
        </Stack>
      </Stack>
    </>
  );
}
