import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardMedia from '@mui/material/CardMedia';
import Stack from '@mui/material/Stack';

import Skeleton from '@mui/material/Skeleton';

export default function QuizOverviewSkeleton() {
  return (
    <Card sx={{ minHeight: '8rem' }}>
      <CardMedia>
        <Skeleton variant="rectangular" height="180px" />
      </CardMedia>
      <CardContent>
        <Stack sx={{ alignItems: 'center' }}>
          <Skeleton height="4rem" width="80%" sx={{ marginBottom: 4 }} />
          <Skeleton height="3rem" width="40%" />
          <Skeleton height="3rem" width="60%" />
        </Stack>
        <Stack direction="row" sx={{ justifyContent: 'center', marginTop: 6 }}>
          <Skeleton variant="rectangular" height="3rem" width="8rem" sx={{ borderRadius: 1 }} />
        </Stack>
      </CardContent>
    </Card>
  );
}
