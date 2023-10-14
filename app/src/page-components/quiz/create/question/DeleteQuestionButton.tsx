import { Tooltip, IconButton, Box } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';

type DeleteQuestionButtonProps = {
  onDelete: () => void;
  disabled: boolean;
};

export default function DeleteQuestionButton({
  onDelete,
  disabled,
}: DeleteQuestionButtonProps) {
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
