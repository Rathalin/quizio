import QuizOverview from '@/components/QuizOverview';
import QuizOverviewPlaceholder from '@/components/QuizOverviewPlaceholder';
import { queryAllPublishedQuizzes } from '@/graphql/quizzes';
import { Alert, Box, Typography } from '@mui/material';
import { useQuery } from '@tanstack/react-query';
import request from 'graphql-request';
import { useSession } from 'next-auth/react';

export default function QuizzesOverview() {
  const { data, isSuccess, isLoading, isError } = useQuery({
    queryKey: ['allPublishedQuizzes'],
    queryFn: () =>
      request(process.env.NEXT_PUBLIC_GRAPHQL_URL, queryAllPublishedQuizzes),
  });

  const quizzes = data?.quizzes?.data ?? [];

  const gridItemMinWidth = '280px';
  const gridItemMaxWidth = '1fr';

  return (
    <Box
      sx={{
        display: 'grid',
        gridTemplateColumns: `repeat(auto-fill, minmax(${gridItemMinWidth}, ${gridItemMaxWidth}))`,
        gap: {
          xs: 2,
          md: 4,
          xl: 6,
        },
      }}
    >
      {isLoading &&
        Array.from({ length: 3 }).map((_, index) => (
          <QuizOverviewPlaceholder key={index} />
        ))}
      {isSuccess &&
        (quizzes.length > 0 ? (
          quizzes.map((quiz) => (
            <QuizOverview
              key={quiz.attributes?.uuid}
              uuid={quiz.attributes?.uuid ?? ''}
              title={quiz.attributes?.title ?? ''}
              description={quiz.attributes?.description ?? ''}
              username={
                quiz.attributes?.owner?.data?.attributes?.username ?? ''
              }
              published={quiz.attributes?.published ?? false}
              questionCount={quiz.attributes?.questions?.data.length ?? 0}
              imageUrl={quiz.attributes?.image?.data?.attributes?.url}
              isMyQuiz={false}
            />
          ))
        ) : (
          <Typography>
            Can you believe it? No one published a quiz yet!
          </Typography>
        ))}
      {isError && <Alert severity="error">Error loading quizzes</Alert>}
    </Box>
  );
}
