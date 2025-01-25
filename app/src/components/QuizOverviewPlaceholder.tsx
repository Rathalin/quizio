import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardMedia from '@mui/material/CardMedia';
import Stack from '@mui/material/Stack';

import PlaceholderTypography from './placeholders/PlaceholderTypography';
import PlaceholderBox from './placeholders/PlaceholderBox';

export default function QuizOverviewPlaceholder() {
  return (
    <Card sx={{ minHeight: '8rem' }}>
      <CardMedia>
        <PlaceholderBox minHeight="12rem" />
      </CardMedia>
      <CardContent>
        <Stack alignItems="start">
          <PlaceholderTypography variant="h3" sx={{ marginTop: 1 }} text="Et consectetur irure." />
          <PlaceholderTypography text="Adipisicing amet dolor ullamco Adipisicing amet dolor ullamco." />
          <PlaceholderTypography text="Et consectetur irure." />
        </Stack>
        <Stack direction="row" justifyContent="center" sx={{ marginTop: 8 }}>
          <PlaceholderBox minHeight="3rem" minWidth="8rem" />
        </Stack>
      </CardContent>
    </Card>
  );
}
