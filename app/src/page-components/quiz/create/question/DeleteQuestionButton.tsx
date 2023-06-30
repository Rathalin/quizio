import { Delete as DeleteIcon } from '@mui/icons-material';
import { IconButton, Box } from '@mui/material';

type DeleteQuestionButtonProps = {
  onDelete: () => void;
  disabled: boolean;
};

export default function DeleteQuestionButton({
  onDelete,
  disabled,
}: DeleteQuestionButtonProps) {
  return (
    <Box>
      <IconButton color="error" disabled={disabled} onClick={() => onDelete()}>
        <DeleteIcon />
      </IconButton>
    </Box>
    // <Tooltip
    //   title={
    //     disabled ? `You cannot delete the first question.` : 'Delete questions'
    //   }
    //   arrow
    // >

    // </Tooltip>
  );
}
