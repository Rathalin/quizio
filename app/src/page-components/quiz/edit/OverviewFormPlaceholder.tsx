import PlaceholderBox from '@/components/placeholders/PlaceholderBox';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Stack from '@mui/material/Stack';

export default function OverviewFormPlaceholder() {
  return (
    <Card>
      <CardContent>
        <Stack
          sx={{
            alignItems: 'start',
            gap: 6,
          }}
        >
          <PlaceholderBox minHeight="3rem" sx={{ width: '100%' }} />
          <PlaceholderBox minHeight="3rem" sx={{ width: '100%' }} />
          <PlaceholderBox minHeight="200px" minWidth="300px" />
        </Stack>
      </CardContent>
    </Card>
  );
}
