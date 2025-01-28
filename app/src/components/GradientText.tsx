import Box from '@mui/material/Box';
import { useTheme } from '@mui/material/styles';

import { PropsWithChildren } from 'react';

type Props = PropsWithChildren<{
  deg?: number;
  startColor?: string;
  endColor?: string;
}>;

export default function GradientText({ deg, startColor, endColor, children }: Props) {
  const theme = useTheme();

  return (
    <Box
      sx={{
        background: `linear-gradient(${(deg ?? 270) + 'deg'} in oklch, ${endColor ?? theme.palette.accent.primary.main} 00%, ${startColor ?? theme.palette.accent.secondary.main} 100%)`,
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
      }}
      component="span"
    >
      {children}
    </Box>
  );
}
