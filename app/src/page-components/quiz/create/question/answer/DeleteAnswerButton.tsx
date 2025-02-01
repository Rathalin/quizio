import { useIsMobile } from '@/custom-hooks/useIsMobile';
import DeleteIcon from '@mui/icons-material/Delete';
import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import { useTranslations } from 'next-intl';

type DeleteAnswerButtonProps = {
  minAnswers: number;
  onDelete: () => void;
  disabled: boolean;
};

export default function DeleteAnswerButton({ minAnswers, onDelete, disabled }: DeleteAnswerButtonProps) {
  const t = useTranslations('quizForm.form.question.answer');
  const isMobile = useIsMobile();

  return (
    <Tooltip
      title={disabled ? t('disabledTooltip', { count: minAnswers }) : t('delete')}
      enterDelay={500}
      enterNextDelay={500}
      arrow
    >
      <Box>
        <IconButton size={isMobile ? 'small' : 'medium'} color="error" disabled={disabled} onClick={() => onDelete()}>
          <DeleteIcon fontSize={isMobile ? 'small' : 'medium'} />
        </IconButton>
      </Box>
    </Tooltip>
  );
}
