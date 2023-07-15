import { Box, Stack } from '@mui/material';
import PlaceholderBox from '../placeholders/PlaceholderBox';
import PlaceholderTypography from '../placeholders/PlaceholderTypography';

export default function UserProfilePlaceholder() {
  return (
    <Stack
      direction="row"
      justifyContent="space-between"
      flexWrap="wrap"
      gap={4}
    >
      <Stack alignItems="start" gap={1}>
        <PlaceholderTypography
          variant="h1"
          text="Excepteur dolore."
          sx={{ marginTop: 0, marginBottom: 2 }}
        />
        <PlaceholderTypography text="Excepteur dolore nostrud." />
        <PlaceholderTypography text="Qui non sint duis quis tempor voluptate nisi dolore nostrud." />
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
