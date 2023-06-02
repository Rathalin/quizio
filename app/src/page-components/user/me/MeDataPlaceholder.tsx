import PlaceholderTypography from '@/components/placeholders/PlaceholderTypography';
import { Stack } from '@mui/material';

export default function MeDataPlaceholder() {
  return (
    <Stack alignItems="start" gap={1}>
      <PlaceholderTypography text="Excepteur dolore." />
      <PlaceholderTypography text="Excepteur dolore nostrud consequat." />
      <PlaceholderTypography text="Excepteur dolore nostrud." />
    </Stack>
  );
}
