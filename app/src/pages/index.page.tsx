import { Box, Stack } from '@mui/material';
import QuizzesOverview from '@/page-components/QuizzesOverview';
import { useSession } from 'next-auth/react';
import LinkButton from '@/components/LinkButton';

export default function Home() {
  const session = useSession();
  return (
    <Box sx={{ marginTop: 2 }}>
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
