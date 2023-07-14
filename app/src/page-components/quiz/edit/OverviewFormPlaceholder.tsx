import PlaceholderBox from '@/components/placeholders/PlaceholderBox';
import { Card, CardContent, Stack } from '@mui/material';

export default function OverviewFormPlaceholder() {
  return (
    <Card>
      <CardContent>
        <Stack alignItems="start" gap={6}>
          <PlaceholderBox minHeight="3rem" sx={{ width: '100%' }} />
          <PlaceholderBox minHeight="3rem" sx={{ width: '100%' }} />
          <PlaceholderBox minHeight="200px" minWidth="300px" />
        </Stack>
      </CardContent>
    </Card>
  );
}
