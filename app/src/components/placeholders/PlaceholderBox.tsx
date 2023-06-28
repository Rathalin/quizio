import { Box, useTheme } from '@mui/material';
import { PropsWithChildren } from 'react';

type PlaceholderBoxProps = PropsWithChildren<{
  minWidth?: string;
  minHeight?: string;
}>;

export default function PlaceholderBox({
  minWidth = '2rem',
  minHeight = '2rem',
  children,
}: PlaceholderBoxProps) {
  const theme = useTheme();
  return (
    <Box
      sx={{
        minHeight,
        minWidth,
        borderRadius: 1,
        backgroundColor: theme.palette.placeholder.main,
        animation: 'flashing 1.5s ease-in-out infinite',
      }}
    >
      {children}
    </Box>
  );
}
