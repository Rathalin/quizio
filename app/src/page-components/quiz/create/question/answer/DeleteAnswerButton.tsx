import { Delete as DeleteIcon } from '@mui/icons-material';
import { Tooltip, IconButton, Box } from '@mui/material';

type DeleteAnswerButtonProps = {
  minAnswers: number;
  onDelete: () => void;
  disabled: boolean;
};

export default function DeleteAnswerButton({
  minAnswers,
  onDelete,
  disabled,
}: DeleteAnswerButtonProps) {
  return (
    <Tooltip
      title={
        disabled
          ? `You cannot delete the first ${minAnswers} answers.`
          : 'Delete answer'
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
