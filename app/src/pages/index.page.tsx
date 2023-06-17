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
      {session.status === 'authenticated' && (
        <Stack
          direction="row"
          justifyContent="center"
          gap={2}
          sx={{ marginBottom: 4 }}
        >
          <LinkButton
            hrefObserver="/quiz/create"
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
