import { Box, useTheme } from '@mui/material';
import { PropsWithChildren } from 'react';

type PlaceholderBoxProps = PropsWithChildren<{
  minHeight?: string;
}>;

export default function PlaceholderBox({
  minHeight = '2rem',
  children,
}: PlaceholderBoxProps) {
  const theme = useTheme();
  return (
    <Box
      sx={{
        minHeight,
        borderRadius: 1,
        backgroundColor: theme.palette.placeholder.main,
      }}
    >
      {children}
    </Box>
  );
}
