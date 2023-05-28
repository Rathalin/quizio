import PlaceholderBox from '@/components/placeholders/PlaceholderBox';
import PlaceholderTypography from '@/components/placeholders/PlaceholderTypography';
import { Box, Stack } from '@mui/material';

export default function MeImagePlaceholder() {
  return (
    <Stack alignItems="center" gap={1}>
      <PlaceholderBox>
        <Box sx={{ minHeight: '6rem', minWidth: '6rem' }}></Box>
      </PlaceholderBox>
      <PlaceholderTypography text="Aliqua in culpa sunt amet dolor." />
    </Stack>
  );
}
