import { Box, Typography, TypographyProps, useTheme } from '@mui/material';

type PlaceholderTypographyProps = {} & Omit<TypographyProps, 'children'>;

export default function PlaceholderTypography({
  lineHeight,
  ...props
}: PlaceholderTypographyProps) {
  const theme = useTheme();
  return (
    <Typography {...props}>
      <Box
        component="span"
        sx={{
          backgroundColor: theme.palette.placeholder.main,
          display: 'flow-root',
          marginBlock: '.4em',
          lineHeight: '1em',
          color: 'transparent',
          userSelect: 'none',
          borderRadius: 1,
        }}
      >
        I
      </Box>
    </Typography>
  );
}
