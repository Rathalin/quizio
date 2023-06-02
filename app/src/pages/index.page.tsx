import { Box, Stack, Typography } from '@mui/material';
import GradientWord from '@/components/GradientWord';
import QuizzesOverview from '@/page-components/QuizzesOverview';
import AccountMenu from '@/page-components/AccountMenu';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import LinkButton from '@/components/LinkButton';

export default function Home() {
  const session = useSession();
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
      {session.status === 'authenticated' && (
        <Stack
          direction="row"
          justifyContent="center"
          gap={2}
          sx={{ marginBottom: 4 }}
        >
          <LinkButton
            hrefObserver="/quiz/create/1-general"
            navigateOnClick
            variant="contained"
            iconSide="right"
          >
            Create your own quiz
          </LinkButton>
        </Stack>
      )}
      <QuizzesOverview />
    </Box>
  );
}
