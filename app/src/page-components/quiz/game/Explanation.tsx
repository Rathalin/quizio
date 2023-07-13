import { Box, Typography, useTheme } from '@mui/material';

type ExplanationProps = {
  correct: boolean;
  text?: string;
};

export default function Explanation({ correct, text }: ExplanationProps) {
  const theme = useTheme();

  const trimmedText = text?.trim();

  return (
    <>
      <Typography variant="h3">
        <Box
          component="span"
          sx={{
            color: correct
              ? theme.palette.success.light
              : theme.palette.error.light,
          }}
        >
          {correct ? 'Correct' : 'Incorrect'}
        </Box>
        <Box component="span" sx={{ marginLeft: 2 }}>
          {correct ? '😀' : '😮'}
        </Box>
      </Typography>
      <Typography>{trimmedText}</Typography>
    </>
  );
}
