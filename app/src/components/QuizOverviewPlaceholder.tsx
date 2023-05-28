import { Card, CardContent, CardMedia, Stack } from '@mui/material';
import PlaceholderTypography from './placeholders/PlaceholderTypography';
import PlaceholderBox from './placeholders/PlaceholderBox';

export default function QuizOverviewPlaceholder() {
  return (
    <Card sx={{ minHeight: '8rem' }}>
      <CardMedia>
        <PlaceholderBox minHeight="10rem" />
      </CardMedia>
      <CardContent>
        <Stack alignItems="start">
          <PlaceholderTypography
            variant="h3"
            sx={{ marginTop: 1 }}
            text="Et consectetur irure."
          />
          <PlaceholderTypography text="Adipisicing amet dolor ullamco Adipisicing amet dolor ullamco." />
          <PlaceholderTypography text="Et consectetur irure." />
        </Stack>
      </CardContent>
    </Card>
  );
}
