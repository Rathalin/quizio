import PlaceholderBox from '@/components/placeholders/PlaceholderBox';
import PlaceholderTypography from '@/components/placeholders/PlaceholderTypography';
import { Stack, Box } from '@mui/material';

export default function MyProfilePlaceholder() {
  return (
    <Stack
      direction="row"
      justifyContent="space-between"
      flexWrap="wrap"
      gap={4}
    >
      <Stack alignItems="start" gap={1}>
        <PlaceholderTypography
          variant="h4"
          text="Excepteur dolore."
          sx={{ marginTop: 0, marginBottom: 2 }}
        />
        <PlaceholderTypography text="Qui non sint duis quis tempor." />
        <PlaceholderTypography text="Excepteur dolore." />
      </Stack>

      <Stack alignItems="center" gap={1}>
        <PlaceholderBox>
          <Box sx={{ minHeight: '6rem', minWidth: '6rem' }}></Box>
        </PlaceholderBox>
        <PlaceholderTypography text="Aliqua in culpa sunt amet dolor." />
      </Stack>
    </Stack>
  );
}
