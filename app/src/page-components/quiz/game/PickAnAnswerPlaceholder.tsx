import PlaceholderTypography from '@/components/placeholders/PlaceholderTypography';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Stack from '@mui/material/Stack';

export default function PickAnAnswerPlaceholder() {
  return (
    <Card sx={{ padding: 4 }}>
      <CardContent>
        <Stack alignItems="start">
          <PlaceholderTypography variant="h1" sx={{ width: '80%', marginTop: 0, marginBottom: 4 }} />
          <PlaceholderTypography variant="h3" sx={{ marginBlock: 1, width: '60%' }} />
          <PlaceholderTypography variant="h3" sx={{ marginBlock: 1, width: '60%' }} />
          <PlaceholderTypography variant="h3" sx={{ marginBlock: 1, width: '60%' }} />
          <PlaceholderTypography variant="h3" sx={{ marginBlock: 1, width: '60%' }} />
        </Stack>
      </CardContent>
    </Card>
  );
}
