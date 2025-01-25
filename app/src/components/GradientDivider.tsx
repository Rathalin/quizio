import Box from '@mui/material/Box';
import { useTheme } from '@mui/material/styles';

export default function GradientDivider() {
  const theme = useTheme();

  return (
    <Box
      sx={{
        height: '2px',
        borderRadius: '4px',
        background: `linear-gradient(270deg, ${theme.palette.accent.primary.main}60 0%, ${theme.palette.accent.secondary.main}60 100%)`,
      }}
    ></Box>
  );
}
