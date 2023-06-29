import { Box } from '@mui/material';
import Head from 'next/head';
import QuizzesOverview from '@/page-components/dashboard/QuizzesOverview';

export default function HomePage() {
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
        <QuizzesOverview />
      </Box>
    </>
  );
}
