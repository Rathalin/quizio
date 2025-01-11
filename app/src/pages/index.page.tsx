import Head from 'next/head';
import { useRouter } from 'next/router';
import AlertsViewer from '@/components/AlertsViewer';
import InvalidTokenAlert from '@/page-components/dashboard/InvalidTokenAlert';
import QuizzesOverview from '@/page-components/dashboard/QuizzesOverview';
import { Box } from '@mui/material';

export default function HomePage() {
  const router = useRouter();

  const showInvalidTokenAlert = router.query.sessionExpired === 'true';
  // useGqlHealthCheck();

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
      <Box>
        <AlertsViewer />
        {showInvalidTokenAlert && <InvalidTokenAlert />}
        <QuizzesOverview />
      </Box>
    </>
  );
}
