import { useIsMobile } from '@/custom-hooks/useIsMobile';
import DeleteIcon from '@mui/icons-material/Delete';
import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';

type DeleteAnswerButtonProps = {
  minAnswers: number;
  onDelete: () => void;
  disabled: boolean;
};

export default function DeleteAnswerButton({ minAnswers, onDelete, disabled }: DeleteAnswerButtonProps) {
  const isMobile = useIsMobile();

  return (
    <Tooltip title={disabled ? `You cannot delete the first ${minAnswers} answers.` : 'Delete answer'} arrow>
      <Box>
        <IconButton size={isMobile ? 'small' : 'medium'} color="error" disabled={disabled} onClick={() => onDelete()}>
          <DeleteIcon fontSize={isMobile ? 'small' : 'medium'} />
        </IconButton>
      </Box>
    </Tooltip>
  );
}
