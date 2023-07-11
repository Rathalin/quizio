import { Box, Typography, TypographyProps, useTheme } from '@mui/material';
import { ElementType } from 'react';

type PlaceholderTypographyProps = { text?: string } & Omit<
  TypographyProps,
  'children'
> & { component?: ElementType<any> };

export default function PlaceholderTypography({
  text = '.',
  ...other
}: PlaceholderTypographyProps) {
  const theme = useTheme();
  return (
    <Typography {...other}>
      <Box
        component="span"
        sx={{
          backgroundColor: theme.palette.placeholder.main,
          display: 'flow-root',
          marginBlock: '.4em',
          lineHeight: '1em',
          minWidth: '1ch',
          color: 'transparent',
          userSelect: 'none',
          borderRadius: 1,
          animation: 'flashing 1.5s ease-in-out infinite',
        }}
      >
        {text}
      </Box>
    </Typography>
  );
}
