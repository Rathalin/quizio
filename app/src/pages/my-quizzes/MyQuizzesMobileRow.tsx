import { GetMyQuizzesResponseQuiz } from '@/api-client';
import Box from '@mui/material/Box';
import { useTranslations } from 'next-intl';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { dateTimeFormatter } from '@/utilities/intlFormats';
import Divider from '@mui/material/Divider';
import { PreviewImage } from './PreviewImage';
import { VisibilityColumn } from './VisibilityColumn';
import Tooltip from '@mui/material/Tooltip';
import Link from 'next/link';
import IconButton from '@mui/material/IconButton';
import DeleteQuizDialog from './DeleteQuizDialog';
import { useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/router';
import { useState } from 'react';
import { useToastStore } from '@/persistence/taost.store';
import { useDeleteQuizMutation } from '@/data/useDeleteQuizMutation';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import ShareIcon from '@mui/icons-material/Share';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import LoadingCircle from '@/components/LoadingCircle';

type Props = GetMyQuizzesResponseQuiz;

export function MyQuizzesMobileRow({
  uuid,
  imageUrl,
  title,
  description,
  createdAt,
  updatedAt,
  isPublished,
  playCount,
}: Props) {
  const t = useTranslations('myQuizzes.table');
  const queryClient = useQueryClient();
  const router = useRouter();
  const [dialogOpen, setDialogOpen] = useState(false);
  const { showSuccessToast, showErrorToast, showInfoToast } = useToastStore();
  const {
    mutateAsync: deleteQuiz,
    isPending: isDeletePending,
    isSuccess: isDeleteSuccess,
  } = useDeleteQuizMutation(uuid);

  async function onDeleteDialogConfirm() {
    try {
      await deleteQuiz();

      showSuccessToast(t('column.action.delete.success'));
      queryClient.invalidateQueries({ queryKey: ['getMyQuizzes'] });
      queryClient.invalidateQueries({ queryKey: ['getQuizzesInfinite'] });
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
      <Box key={uuid}>
        <Stack columnGap={4} rowGap={2}>
          <Box>
            <PreviewImage url={imageUrl} width={150} />
          </Box>
          <Box sx={{ maxWidth: '30ch' }}>
            <Typography
              variant="h4"
              component="p"
              color="textPrimary"
              sx={{
                overflow: 'hidden',
                whiteSpace: 'pre',
                textOverflow: 'ellipsis',
              }}
            >
              {title}
            </Typography>
            <Typography
              color="textSecondary"
              sx={{
                overflow: 'hidden',
                whiteSpace: 'pre-line',
                textOverflow: 'ellipsis',
                display: '-webkit-box',
                WebkitBoxOrient: 'vertical',
                WebkitLineClamp: 2,
                marginTop: 1,
              }}
            >
              {description}
            </Typography>
          </Box>
        </Stack>
        <Stack direction="row" gap={1} flexWrap="wrap" sx={{ marginTop: 2 }}>
          <Tooltip title={t('column.action.edit.tooltip')} enterDelay={500} enterNextDelay={500} arrow>
            <Stack alignItems="center">
              <Link href={`/quiz/edit/${uuid}`}>
                <IconButton color="inherit" size="large">
                  <EditIcon />
                </IconButton>
              </Link>
              <Typography color="textSecondary" variant="caption">
                {t('column.action.edit.label')}
              </Typography>
            </Stack>
          </Tooltip>
          <Tooltip title={t('column.action.delete.tooltip')} enterDelay={500} enterNextDelay={500} arrow>
            <Stack alignItems="center">
              <IconButton
                color="inherit"
                size="large"
                onClick={() => {
                  setDialogOpen(true);
                }}
                disabled={isDeletePending || isDeleteSuccess}
              >
                {isDeletePending ? <LoadingCircle /> : <DeleteIcon />}
              </IconButton>
              <Typography color="textSecondary" variant="caption">
                {t('column.action.delete.label')}
              </Typography>
            </Stack>
          </Tooltip>
          <Tooltip title={t('column.action.copyLink.tooltip')} enterDelay={500} enterNextDelay={500} arrow>
            <Stack alignItems="center">
              <IconButton
                color="inherit"
                size="large"
                onClick={() => {
                  navigator.clipboard.writeText(`${window.location.origin}/play/${uuid}`);
                  showInfoToast(t('column.action.copyLink.toast'));
                }}
              >
                <ShareIcon />
              </IconButton>
              <Typography color="textSecondary" variant="caption">
                {t('column.action.copyLink.label')}
              </Typography>
            </Stack>
          </Tooltip>
          <Tooltip title={t('column.action.play.tooltip')} enterDelay={500} enterNextDelay={500} arrow>
            <Stack alignItems="center">
              <Link href={`/play/${uuid}`}>
                <IconButton color="inherit" size="large">
                  <PlayArrowIcon />
                </IconButton>
              </Link>
              <Typography color="textSecondary" variant="caption">
                {t('column.action.play.label')}
              </Typography>
            </Stack>
          </Tooltip>
        </Stack>
        <Box sx={{ marginBlock: 2 }}>
          <Typography color="textSecondary" sx={{ marginBottom: 0.5 }}>
            {t('column.isPublished.header')}
          </Typography>
          <VisibilityColumn uuid={uuid} isPublished={isPublished} size="medium" />
        </Box>
        <Stack direction="row" columnGap={6} rowGap={2} flexWrap="wrap">
          <Stack>
            <Typography variant="body2" color="textSecondary">
              {t('column.createdAt.header')}
            </Typography>
            <Typography variant="body2">{dateTimeFormatter.format(new Date(createdAt))}</Typography>
          </Stack>
          <Stack>
            <Typography variant="body2" color="textSecondary">
              {t('column.updatedAt.header')}
            </Typography>
            <Typography variant="body2">{dateTimeFormatter.format(new Date(updatedAt))}</Typography>
          </Stack>
        </Stack>
        <Stack sx={{ marginTop: 3 }}>
          <Typography noWrap>
            {t.rich('column.playCount.label', {
              count: playCount,
              span: (chunks) => (
                <Typography component="span" variant="body1">
                  {chunks}
                </Typography>
              ),
              spanSecondary: (chunks) => (
                <Typography component="span" color="textSecondary" variant="body2" noWrap>
                  {chunks}
                </Typography>
              ),
            })}
          </Typography>
        </Stack>
        <Divider sx={{ marginTop: 2 }} />
      </Box>
    </>
  );
}
