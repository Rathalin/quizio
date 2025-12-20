import LoadingCircle from '@/components/LoadingCircle';
import { useDeleteQuizMutation } from '@/data/useDeleteQuizMutation';
import { useToastStore } from '@/persistence/taost.store';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import { useQueryClient } from '@tanstack/react-query';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useState } from 'react';
import Tooltip from '@mui/material/Tooltip';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import DeleteQuizDialog from './DeleteQuizDialog';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import ShareIcon from '@mui/icons-material/Share';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import { useTranslations } from 'next-intl';
import { PreviewImage } from './PreviewImage';

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
    } catch {
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
        <PreviewImage url={imageUrl} width={112.5} />
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
                <Box>
                  <Link href={`/quiz/edit/${uuid}`}>
                    <IconButton color="primary">
                      <EditIcon fontSize="small" />
                    </IconButton>
                  </Link>
                </Box>
              </Tooltip>
              <Tooltip title={t('column.action.delete.tooltip')} enterDelay={500} enterNextDelay={500} arrow>
                <Box>
                  <IconButton
                    color="primary"
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
                  <IconButton
                    color="primary"
                    onClick={() => {
                      navigator.clipboard.writeText(`${window.location.origin}/play/${uuid}`);
                      showInfoToast(t('column.action.copyLink.toast'));
                    }}
                  >
                    <ShareIcon fontSize="small" />
                  </IconButton>
                </Box>
              </Tooltip>
              <Tooltip title={t('column.action.play.tooltip')} enterDelay={500} enterNextDelay={500} arrow>
                <Box>
                  <Link href={`/play/${uuid}`}>
                    <IconButton color="primary">
                      <PlayArrowIcon fontSize="small" />
                    </IconButton>
                  </Link>
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
