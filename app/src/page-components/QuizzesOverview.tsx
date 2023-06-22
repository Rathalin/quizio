import QuizOverview from '@/components/QuizOverview';
import QuizOverviewPlaceholder from '@/components/QuizOverviewPlaceholder';
import { getAllPublishedQuizzesGQL } from '@/graphql/quizzes';
import { Alert, Box, Typography } from '@mui/material';
import { useQuery } from '@tanstack/react-query';
import request from 'graphql-request';
import { useSession } from 'next-auth/react';
import QuizzesFilterBar from './QuizzesFilterBar';
import { useState } from 'react';

export default function QuizzesOverview() {
  const { data: session, status } = useSession();
  const { data, isSuccess, isLoading, isError } = useQuery({
    queryKey: ['allPublishedQuizzes'],
    queryFn: () =>
      request(process.env.NEXT_PUBLIC_GRAPHQL_URL, getAllPublishedQuizzesGQL),
  });
  const [searchText, setSearchText] = useState('');
  const filteredQuizzesCount = data?.quizzes?.data.length ?? 0;

  const quizzes = data?.quizzes?.data ?? [];

  const gridItemMinWidth = '280px';
  const gridItemMaxWidth = '1fr';

  return (
    <Box>
      <Box sx={{ marginBottom: 4 }}>
        <QuizzesFilterBar
          searchText={searchText}
          setSearchText={setSearchText}
          filteredQuizzesCount={filteredQuizzesCount}
        />
      </Box>
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: `repeat(auto-fill, minmax(${gridItemMinWidth}, ${gridItemMaxWidth}))`,
          columnGap: {
            xs: 6,
          },
          rowGap: {
            xs: 8,
            md: 6,
          },
        }}
      >
        {isLoading &&
          Array.from({ length: 6 }).map((_, index) => (
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
                createdAt={new Date(quiz.attributes?.createdAt)}
                published={quiz.attributes?.published ?? false}
                questionCount={quiz.attributes?.questions?.data.length ?? 0}
                playCount={quiz.attributes?.playCount ?? 0}
                imageUrl={quiz.attributes?.image?.data?.attributes?.url}
                isMyQuiz={
                  quiz.attributes?.owner?.data?.attributes?.username ===
                  session?.user.username
                }
              />
            ))
          ) : (
            <Typography>
              Can you believe it? No one published a quiz yet!
            </Typography>
          ))}
        {isError && <Alert severity="error">Error loading quizzes</Alert>}
      </Box>
    </Box>
  );
}
