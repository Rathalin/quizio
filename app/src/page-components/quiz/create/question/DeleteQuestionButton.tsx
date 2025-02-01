import DeleteIcon from '@mui/icons-material/Delete';
import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import { useTranslations } from 'next-intl';

type DeleteQuestionButtonProps = {
  onDelete: () => void;
  disabled: boolean;
};

export default function DeleteQuestionButton({ onDelete, disabled }: DeleteQuestionButtonProps) {
  const t = useTranslations('quizForm.form.question.delete');
  return (
    <Tooltip title={disabled ? t('tooltip.minQuestionsError') : t('tooltip.default')} arrow>
      <Box>
        <IconButton
          color="error"
          disabled={disabled}
          onClick={(e) => {
            e.stopPropagation();
            onDelete();
          }}
        >
          <DeleteIcon />
        </IconButton>
      </Box>
    </Tooltip>
  );
}
