import { Check as CheckIcon, Clear as ClearIcon } from '@mui/icons-material';
import { IconButton, Tooltip } from '@mui/material';

type CorrectToggleProps = {
  isCorrect: boolean;
  onChange: (isCorrect: boolean) => void;
};

export default function CorrectToggle({
  isCorrect,
  onChange,
}: CorrectToggleProps) {
  const tooltipTitle = isCorrect ? 'Marked as correct' : 'Marked as incorrect';
  const icon = isCorrect ? (
    <CheckIcon color="success" />
  ) : (
    <ClearIcon color="error" />
  );
  return (
    <Tooltip title={tooltipTitle} arrow>
      <IconButton onClick={() => onChange(!isCorrect)}>{icon}</IconButton>
    </Tooltip>
  );
}
