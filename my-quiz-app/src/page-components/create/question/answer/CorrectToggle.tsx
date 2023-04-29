import { CheckOutlined, ClearOutlined } from '@mui/icons-material';
import { Box, IconButton, Tooltip } from '@mui/material';

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
    <CheckOutlined color="success" />
  ) : (
    <ClearOutlined color="error" />
  );
  return (
    <Tooltip title={tooltipTitle} arrow>
      <IconButton onClick={() => onChange(!isCorrect)}>{icon}</IconButton>
    </Tooltip>
  );
}
