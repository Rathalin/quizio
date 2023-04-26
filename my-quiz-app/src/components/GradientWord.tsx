import { Box, Typography } from '@mui/material';
import { PropsWithChildren } from 'react';

type GradientWordProps = PropsWithChildren<{
  startColor?: string;
  endColor?: string;
}>;

export default function GradientWord({
  startColor = '#00B3FF',
  endColor = '#FF9900',
  children,
}: GradientWordProps) {
  return (
    <Box
      sx={{
        background: `linear-gradient(270deg, ${endColor} 00%, ${startColor} 100%)`,
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
      }}
      component="span"
    >
      {children}
    </Box>
  );
}
