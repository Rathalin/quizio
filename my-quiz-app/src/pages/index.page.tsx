import { Box, Typography } from '@mui/material';
import GradientWord from '@/components/GradientWord';
import QuizzesOverview from '@/page-components/QuizzesOverview';
import AccountMenu from '@/page-components/AccountMenu';
import Link from 'next/link';

export default function Home() {
  return (
    <Box>
      <Typography
        component="h1"
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '4rem',
          marginTop: {
            xs: 0,
            lg: 4,
          },
          marginBottom: 4,
        }}
      >
        <Link href="/" style={{ textDecoration: 'none' }}>
          <GradientWord>Quizio</GradientWord>
        </Link>
        <Box sx={{ marginLeft: 'auto' }}>
          <AccountMenu />
        </Box>
      </Typography>
      <QuizzesOverview />
    </Box>
  );
}
