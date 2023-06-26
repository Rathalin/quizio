import PlaceholderTypography from '@/components/placeholders/PlaceholderTypography';
import { useIsMobile } from '@/custom-hooks/useIsMobile';
import { Card, CardContent, Stack } from '@mui/material';

export default function PickAnAnswerPlaceholder() {
  const isMobile = useIsMobile();

  return (
    <Card sx={{ padding: 4 }}>
      <CardContent>
        <Stack alignItems="start">
          <PlaceholderTypography
            variant="h1"
            sx={{ width: '80%', marginTop: 0 }}
          />
          <PlaceholderTypography
            variant="h3"
            sx={{ marginBlock: 1, width: '60%' }}
          />
          <PlaceholderTypography
            variant="h3"
            sx={{ marginBlock: 1, width: '60%' }}
          />
          <PlaceholderTypography
            variant="h3"
            sx={{ marginBlock: 1, width: '60%' }}
          />
          <PlaceholderTypography
            variant="h3"
            sx={{ marginBlock: 1, width: '60%' }}
          />
        </Stack>
      </CardContent>
    </Card>
  );
}
