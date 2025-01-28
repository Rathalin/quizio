import { prefixWithBackendUrl } from '@/utilities/urlUtils';
import { GameImage } from './GameImage';
import { useTheme } from '@mui/material/styles';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';

const correctEmojies = ['😀', '😁', '😃', '😄', '😆', '😊', '😎'];
const incorrectEmojies = ['😐', '😶', '😮', '😯', '🫤', '🫥', '😮‍💨'];

type ExplanationProps = {
  correct: boolean;
  text?: string;
  imageUrl: string | null;
};

export default function Explanation({ correct, text, imageUrl }: ExplanationProps) {
  const theme = useTheme();

  function getRandomEmoji(correct: boolean) {
    const array = correct ? correctEmojies : incorrectEmojies;
    return array.at(Math.floor(Math.random() * array.length));
  }

  return (
    <>
      {imageUrl != null && (
        <Stack sx={{ marginBottom: 4 }}>
          <GameImage src={prefixWithBackendUrl(imageUrl)} alt="Explanation image" />
        </Stack>
      )}
      <Typography variant="h3">
        <Box
          component="span"
          sx={{
            color: correct ? theme.palette.success.light : theme.palette.error.light,
          }}
        >
          {correct ? 'Correct' : 'Incorrect'}
        </Box>
        <Box component="span" sx={{ marginLeft: 2 }}>
          {getRandomEmoji(correct)}
        </Box>
      </Typography>
      <Typography sx={{ whiteSpace: 'pre-line' }}>{text}</Typography>
    </>
  );
}
