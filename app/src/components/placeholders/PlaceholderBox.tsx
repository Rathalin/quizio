import Box from '@mui/material/Box';
import { SxProps, Theme, useTheme } from '@mui/material/styles';
import { PropsWithChildren } from 'react';

type PlaceholderBoxProps = PropsWithChildren<{
  minWidth?: string;
  minHeight?: string;
  sx?: SxProps<Theme>;
}>;

export default function PlaceholderBox({ minWidth = '2rem', minHeight = '2rem', sx, children }: PlaceholderBoxProps) {
  const theme = useTheme();
  return (
    <Box
      sx={{
        minHeight,
        minWidth,
        borderRadius: 1,
        backgroundColor: theme.vars.palette.placeholder.main,
        animation: 'flashing 1.5s ease-in-out infinite',
        ...sx,
      }}
    >
      {children}
    </Box>
  );
}
