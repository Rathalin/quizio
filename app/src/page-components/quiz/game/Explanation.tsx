import { prefixWithBackendUrl } from '@/utilities/urlUtils';
import { GameImage } from './GameImage';
import { useTheme } from '@mui/material/styles';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import { useTranslations } from 'next-intl';

const correctEmojies = ['😀', '😁', '😃', '😄', '😆', '😊', '😎'];
const incorrectEmojies = ['😐', '😶', '😮', '😯', '🫤', '🫥', '😮‍💨'];

type ExplanationProps = {
  correct: boolean;
  text?: string;
  imageUrl: string | null;
};

export default function Explanation({ correct, text, imageUrl }: ExplanationProps) {
  const t = useTranslations('play.answer');
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
      <Typography
        variant="h3"
        sx={{
          marginTop: 1,
          marginBottom: 3,
        }}
      >
        <Box
          component="span"
          sx={{
            color: correct ? theme.vars?.palette.success.light : theme.vars?.palette.error.light,
          }}
        >
          {correct ? t('correct') : t('incorrect')}
        </Box>
        <Box component="span" sx={{ marginLeft: 2 }}>
          {getRandomEmoji(correct)}
        </Box>
      </Typography>
      <Typography sx={{ whiteSpace: 'pre-line' }}>{text}</Typography>
    </>
  );
}
