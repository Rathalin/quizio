import { CheckOutlined, ClearOutlined } from '@mui/icons-material';
import { Box, IconButton } from '@mui/material';

type CorrectToggleProps = {
  isCorrect: boolean;
  onChange: (isCorrect: boolean) => void;
};

export default function CorrectToggle({
  isCorrect,
  onChange,
}: CorrectToggleProps) {
  return (
    <IconButton onClick={() => onChange(!isCorrect)}>
      {isCorrect ? (
        <CheckOutlined color="success" />
      ) : (
        <ClearOutlined color="error" />
      )}
    </IconButton>
  );
}
