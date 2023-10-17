import { Box, Stack, Typography, useTheme } from '@mui/material';
import Image from 'next/image';
import { useImageDimensions } from './useImageDimensions';
import { getBackendImageUrl } from '@/utilities/getImageUrl';

const correctEmojies = ['😀', '😁', '😃', '😄', '😆', '😊', '😎'];
const incorrectEmojies = ['😐', '😶', '😮', '😯', '🫤', '🫥', '😮‍💨'];

type ExplanationProps = {
  correct: boolean;
  text?: string;
  imageUrl: string | null;
};

export default function Explanation({
  correct,
  text,
  imageUrl,
}: ExplanationProps) {
  const theme = useTheme();
  const { width, height } = useImageDimensions();

  const trimmedText = text?.trim();

  function getRandomEmoji(correct: boolean) {
    const array = correct ? correctEmojies : incorrectEmojies;
    return array.at(Math.floor(Math.random() * array.length));
  }

  return (
    <>
      {imageUrl != null && (
        <Stack sx={{ marginBottom: 4 }}>
          <Image
            src={getBackendImageUrl(imageUrl)}
            alt={`Explanation image`}
            width={width}
            height={height}
            style={{
              objectFit: 'cover',
              borderRadius: '4px',
            }}
            unoptimized
          />
        </Stack>
      )}
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
