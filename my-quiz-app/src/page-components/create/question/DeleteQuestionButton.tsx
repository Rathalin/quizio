import { Delete as DeleteIcon } from '@mui/icons-material';
import { Tooltip, IconButton, Box } from '@mui/material';

type DeleteQuestionButtonProps = {
  index: number;
  onDelete: () => void;
};

export default function DeleteQuestionButton({
  index,
  onDelete,
}: DeleteQuestionButtonProps) {
  const minQuestions = 1;
  const disabled = index + 1 <= minQuestions;

  return (
    <Tooltip
      title={
        disabled ? `You cannot delete the first question.` : 'Delete questions'
      }
      arrow
    >
      <Box>
        <IconButton
          color="error"
          disabled={disabled}
          onClick={() => onDelete()}
        >
          <DeleteIcon />
        </IconButton>
      </Box>
    </Tooltip>
  );
}
