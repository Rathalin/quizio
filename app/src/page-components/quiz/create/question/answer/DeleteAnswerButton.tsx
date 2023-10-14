import { useIsMobile } from '@/custom-hooks/useIsMobile';
import { Tooltip, IconButton, Box } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';

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
  const isMobile = useIsMobile();

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
          size={isMobile ? 'small' : 'medium'}
          color="error"
          disabled={disabled}
          onClick={() => onDelete()}
        >
          <DeleteIcon fontSize={isMobile ? 'small' : 'medium'} />
        </IconButton>
      </Box>
    </Tooltip>
  );
}
