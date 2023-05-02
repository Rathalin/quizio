import { Card, CardContent, Box, Grid, CardHeader } from '@mui/material';
import PlaceholderBox from './placeholders/PlaceholderBox';
import PlaceholderTypography from './placeholders/PlaceholderTypography';

export default function QuizOverviewPlaceholder() {
  return (
    <Card sx={{ minHeight: '8rem' }}>
      <CardContent>
        <Grid container>
          <Grid item xs={12} sm={8}>
            <PlaceholderTypography variant="h3" sx={{ marginTop: 1 }} />
          </Grid>
        </Grid>
        <Grid container>
          <Grid item xs={6} sm={4}>
            <PlaceholderTypography />
          </Grid>
        </Grid>
        <Grid container>
          <Grid item xs={4} sm={3}>
            <PlaceholderTypography />
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );
}
