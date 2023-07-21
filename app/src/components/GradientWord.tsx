import { Box, useTheme } from '@mui/material';
import { PropsWithChildren } from 'react';

type GradientWordProps = PropsWithChildren<{
  startColorLight?: string;
  endColorLight?: string;
  startColorDark?: string;
  endColorDark?: string;
}>;

export default function GradientWord({ children }: GradientWordProps) {
  const theme = useTheme();

  return (
    <Box
      sx={{
        background: `linear-gradient(270deg, ${theme.palette.accent.primary.main} 00%, ${theme.palette.accent.secondary.main} 100%)`,
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
      }}
      component="span"
    >
      {children}
    </Box>
  );
}
