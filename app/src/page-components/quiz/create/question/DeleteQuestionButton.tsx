import DeleteIcon from '@mui/icons-material/Delete';
import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';

type DeleteQuestionButtonProps = {
  onDelete: () => void;
  disabled: boolean;
};

export default function DeleteQuestionButton({ onDelete, disabled }: DeleteQuestionButtonProps) {
  return (
    <Tooltip title={disabled ? `You cannot delete the first question.` : 'Delete questions'} arrow>
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
