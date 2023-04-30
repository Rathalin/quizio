import GradientWord from '@/components/GradientWord';
import LinkButton from '@/components/LinkButton';
import MyQuizOverview from '@/components/MyQuizOverview';
import MyQuizOverviewPlaceholder from '@/components/MyQuizOverviewPlaceholder';
import { useMyQuizsOverviewQuery } from '@/graphql/myQuiz/useMyQuizsQuery';
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Typography,
} from '@mui/material';
import Link from 'next/link';

export default function Home() {
  const myQuizsOverviewQuery = useMyQuizsOverviewQuery('1');

  return (
    <Box>
      <Typography
        component="h1"
        sx={{
          fontSize: '4rem',
          marginBlock: 4,
          display: 'flex',
          justifyContent: 'center',
        }}
      >
        <GradientWord>Quizio</GradientWord>
      </Typography>

      <Typography variant="h2" sx={{ marginTop: 4 }}>
        Your quizes
      </Typography>
      <Box sx={{ display: 'flex', flexDirection: 'column', rowGap: 2 }}>
        {myQuizsOverviewQuery.isLoading && <MyQuizOverviewPlaceholder />}
        {myQuizsOverviewQuery.isError && (
          <Alert severity="error">Could not load your quizes.</Alert>
        )}
        {myQuizsOverviewQuery.isSuccess &&
          myQuizsOverviewQuery.data.myQuizs?.data.map((quiz) => (
            <MyQuizOverview
              title={quiz.attributes?.title ?? ''}
              description={quiz.attributes?.description ?? ''}
              questionCount={2}
            />
          ))}
      </Box>

      <Box
        sx={{
          marginTop: 4,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <LinkButton
          hrefObserver="/create/1-general"
          navigateOnClick
          iconSide="right"
          variant="contained"
        >
          Create a new quiz
        </LinkButton>
      </Box>
    </Box>
  );
}
