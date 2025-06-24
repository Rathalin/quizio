import { GetMyQuizzesResponseQuiz } from '@/api-client';
import Box from '@mui/material/Box';
import { useTranslations } from 'next-intl';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Divider from '@mui/material/Divider';
import { PreviewImage } from './PreviewImage';
import { VisibilityColumn } from './VisibilityColumn';
import Link from 'next/link';
import IconButton from '@mui/material/IconButton';
import DeleteQuizDialog from './DeleteQuizDialog';
import { useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/router';
import { ReactNode, useState } from 'react';
import { useToastStore } from '@/persistence/taost.store';
import { useDeleteQuizMutation } from '@/data/useDeleteQuizMutation';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import ShareIcon from '@mui/icons-material/Share';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import LoadingCircle from '@/components/LoadingCircle';
import LinkButton from '@/components/LinkButton';
import TimelineIcon from '@mui/icons-material/Timeline';
import { useDateTimeFormatter } from '@/utilities/useDateFormatter';

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
  const dateTimeFormatter = useDateTimeFormatter();
  const [dialogOpen, setDialogOpen] = useState(false);
  const { showSuccessToast, showErrorToast } = useToastStore();
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
        <Box
          marginBottom={4}
          sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', columnGap: 2 }}
        >
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
                  maxWidth: 'max-content',
                  overflow: 'hidden',
                  whiteSpace: 'pre-line',
                  textOverflow: 'ellipsis',
                  display: '-webkit-box',
                  WebkitBoxOrient: 'vertical',
                  WebkitLineClamp: 5,
                  marginTop: 1,
                }}
              >
                {description}
              </Typography>
            </Box>
          </Stack>
          <Box marginTop={2} flex={1}>
            <ActionButtons
              uuid={uuid}
              setDialogOpen={setDialogOpen}
              isDeletePending={isDeletePending}
              isDeleteSuccess={isDeleteSuccess}
            />
          </Box>
        </Box>
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
        <Stack sx={{ marginTop: 4 }} gap={1}>
          <Typography noWrap>
            {t.rich('column.playCount.label', {
              count: playCount,
              b: (chunks) => (
                <Typography component="span" variant="body1">
                  {chunks}
                </Typography>
              ),
              secondary: (chunks) => (
                <Typography component="span" color="textSecondary" variant="body2" noWrap>
                  {chunks}
                </Typography>
              ),
            })}
          </Typography>
          <LinkButton hrefObserver={`/my-quizzes/${uuid}/trends`} navigateOnClick startIcon={<TimelineIcon />}>
            {t('column.playCount.trendsButton.label')}
          </LinkButton>
        </Stack>
        <Divider sx={{ marginTop: 2 }} />
      </Box>
    </>
  );
}

type ActionButtonsProps = {
  uuid: string;
  setDialogOpen: (open: boolean) => void;
  isDeletePending: boolean;
  isDeleteSuccess: boolean;
};

function ActionButtons({ uuid, setDialogOpen, isDeletePending, isDeleteSuccess }: ActionButtonsProps) {
  const { showInfoToast } = useToastStore();
  const t = useTranslations('myQuizzes.table');
  return (
    <Box
      sx={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(70px, 1fr))',
        gap: 1,
      }}
    >
      <ActionButton
        title={t('column.action.edit.tooltip')}
        icon={<EditIcon />}
        label={t('column.action.edit.label')}
        href={`/quiz/edit/${uuid}`}
      />
      <ActionButton
        title={t('column.action.delete.tooltip')}
        onClick={() => {
          setDialogOpen(true);
        }}
        icon={isDeletePending ? <LoadingCircle /> : <DeleteIcon />}
        disabled={isDeletePending || isDeleteSuccess}
        label={t('column.action.delete.label')}
      />
      <ActionButton
        title={t('column.action.copyLink.tooltip')}
        icon={<ShareIcon />}
        label={t('column.action.copyLink.label')}
        onClick={() => {
          navigator.clipboard.writeText(`${window.location.origin}/play/${uuid}`);
          showInfoToast(t('column.action.copyLink.toast'));
        }}
      />
      <ActionButton
        title={t('column.action.play.tooltip')}
        icon={<PlayArrowIcon />}
        label={t('column.action.play.label')}
        href={`/play/${uuid}`}
      />
    </Box>
  );
}

type ActionButtonProps = {
  title: string;
  href?: string;
  onClick?: () => void;
  disabled?: boolean;
  icon: ReactNode;
  label: string;
};

function ActionButton({ href, onClick, disabled, icon, label }: ActionButtonProps) {
  return (
    <Stack alignItems="center">
      {href != null ? (
        <Link href={href}>
          <IconButton color="inherit" size="large">
            {icon}
          </IconButton>
        </Link>
      ) : (
        <IconButton color="inherit" size="large" onClick={onClick} disabled={disabled}>
          {icon}
        </IconButton>
      )}
      <Typography color="textSecondary" variant="caption" textAlign="center">
        {label}
      </Typography>
    </Stack>
  );
}
