import QuizOverview from '@/components/QuizOverview';
import QuizOverviewPlaceholder from '@/components/QuizOverviewPlaceholder';
import { queryAllPublishedQuizzes } from '@/graphql/quizzes';
import { Alert, Box, Typography } from '@mui/material';
import { useQuery } from '@tanstack/react-query';
import request from 'graphql-request';

export default function QuizzesOverview() {
  const { data, isSuccess, isLoading, isError } = useQuery({
    queryKey: ['allQuizzes'],
    queryFn: () =>
      request(process.env.NEXT_PUBLIC_GRAPHQL_URL, queryAllPublishedQuizzes),
  });

  const quizzes = data?.quizzes?.data ?? [];

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        gap: 2,
      }}
    >
      {isLoading && <QuizOverviewPlaceholder />}
      {quizzes.length > 0 ? (
        quizzes.map((quiz) => (
          <QuizOverview
            key={quiz.id}
            title={quiz.attributes?.title ?? ''}
            description={quiz.attributes?.description ?? ''}
            published={quiz.attributes?.published ?? false}
            questionCount={quiz.attributes?.questions?.data.length ?? 0}
            imageUrl={quiz.attributes?.image?.data?.attributes?.url}
            isMyQuiz={true}
          />
        ))
      ) : (
        <Typography>
          Can you believe it? No one published a quiz yet!
        </Typography>
      )}
      {isError && <Alert severity="error">Error loading quizzes</Alert>}
    </Box>
  );
}
