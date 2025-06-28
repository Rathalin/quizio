import { Box, BoxProps } from '@mui/material';

type Props = BoxProps;

export function ScreenReaderOnly({ children, sx, ...other }: Props) {
  return (
    <Box
      sx={{
        position: 'absolute',
        width: 1,
        height: 1,
        padding: 0,
        margin: '-1px',
        overflow: 'hidden',
        clip: 'rect(0 0 0 0)',
        whiteSpace: 'nowrap',
        border: 0,
        top: 0,
        left: 0,
        ...sx,
      }}
      {...other}
    >
      {children}
    </Box>
  );
}
