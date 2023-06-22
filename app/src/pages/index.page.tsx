import { Box, Divider, Stack } from '@mui/material';
import { useSession } from 'next-auth/react';
import LinkButton from '@/components/LinkButton';
import Head from 'next/head';
import QuizzesOverview from '@/page-components/dashboard/QuizzesOverview';

export default function Home() {
  const session = useSession();
  return (
    <>
      <Head>
        <meta
          name="description"
          content="Quizo is a quiz app that allows you to create and share quizzes with your friends."
        />
        <meta property="og:title" content="Quizio - The modern quizz app" />
        <meta
          property="og:description"
          content="Create and share quizzes with your friends."
        />
        <meta property="og:image" content="public/favicion" />
      </Head>
      <Box sx={{ marginTop: 2 }}>
        {session.status === 'authenticated' && (
          <>
            <Stack direction="row" justifyContent="center" gap={2}>
              <LinkButton
                hrefObserver="/quiz/create"
                navigateOnClick
                variant="contained"
                iconSide="right"
              >
                Create your own quiz
              </LinkButton>
            </Stack>
            <Divider sx={{ marginBlock: 4 }} />
          </>
        )}
        <QuizzesOverview />
      </Box>
    </>
  );
}
