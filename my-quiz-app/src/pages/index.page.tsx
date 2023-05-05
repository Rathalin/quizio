import { Box, Button, Grid, Typography } from '@mui/material';
import GradientWord from '@/components/GradientWord';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/router';
import QuizzesOverview from '@/page-components/QuizzesOverview';
import AccountMenu from '@/page-components/AccountMenu';

export default function Home() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const isAuthenticated = status === 'authenticated';

  return (
    <Box>
      <Grid container sx={{ alignItems: 'center' }}>
        <Grid item xs={2}></Grid>
        <Grid item xs={8}>
          <Typography
            component="h1"
            sx={{
              fontSize: '4rem',
              marginBlock: 4,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <GradientWord>Quizio</GradientWord>
          </Typography>
        </Grid>
        <Grid item xs={2} sx={{ display: 'flex', justifyContent: 'end' }}>
          <AccountMenu />
        </Grid>
      </Grid>
      <QuizzesOverview />
    </Box>
  );
}
