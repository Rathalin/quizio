import { Box, Typography, useTheme } from '@mui/material';

type ExplanationProps = {
  correct: boolean;
  text?: string;
};

const correctEmojies = ['😀', '😁', '😃', '😄', '😆', '😊', '😎'];
const incorrectEmojies = ['😐', '😶', '😮', '😯', '😲', '🫤'];

export default function Explanation({ correct, text }: ExplanationProps) {
  const theme = useTheme();

  const trimmedText = text?.trim();

  function getRandomEmoji(correct: boolean) {
    const array = correct ? correctEmojies : incorrectEmojies;
    return array.at(Math.floor(Math.random() * array.length));
  }

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
          {getRandomEmoji(correct)}
        </Box>
      </Typography>
      <Typography>{trimmedText}</Typography>
    </>
  );
}
