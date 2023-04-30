import { Box } from '@mui/material';
import { PropsWithChildren } from 'react';

type PlaceholderBoxProps = PropsWithChildren<{
  minHeight?: string;
}>;

export default function PlaceholderBox({
  minHeight = '2rem',
  children,
}: PlaceholderBoxProps) {
  return (
    <Box
      sx={{
        minHeight,
        borderRadius: 1,
        backgroundColor: '#313131',
      }}
    >
      {children}
    </Box>
  );
}
