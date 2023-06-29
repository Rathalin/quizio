import QuizOverview from '@/components/QuizOverview';
import QuizOverviewPlaceholder from '@/components/QuizOverviewPlaceholder';
import { getAllPublishedQuizzesGQL } from '@/graphql/quizzes';
import { Alert, Box, Typography } from '@mui/material';
import { useQuery } from '@tanstack/react-query';
import request from 'graphql-request';
import { useSession } from 'next-auth/react';
import { useMemo, useState } from 'react';
import { SearchContextProvider } from './search.context';
import { Sort, SortContextProvider, defaultSort } from './sort.context';
import { QuizEntity } from '@/graphql/generated/graphql';
import FilterBar from './filter-bar/FilterBar';

export default function QuizzesOverview() {
  const { data: session, status } = useSession();
  const [searchText, setSearchText] = useState('');
  const [sort, setSort] = useState<Sort>(defaultSort);
  const { data, isSuccess, isLoading, isError } = useQuery({
    queryKey: ['allPublishedQuizzes', sort.option, sort.mode],
    queryFn: () =>
      request(process.env.NEXT_PUBLIC_GRAPHQL_URL, getAllPublishedQuizzesGQL, {
        sortFields: [`${sort.option}:${sort.mode}`],
      }),
  });

  const quizzes = useMemo(
    () => (data?.quizzes?.data ?? []) as QuizEntity[],
    [data?.quizzes?.data]
  );
  const searchedQuizzes = useMemo(() => {
    const searchKey = searchText.trim().toLowerCase();
    return searchText.trim() === ''
      ? quizzes
      : quizzes.filter((quiz) => {
          const textToSearch = `${
            quiz.attributes?.title?.toLowerCase() ?? ''
          } ${quiz.attributes?.description?.toLowerCase() ?? ''} ${
            quiz.attributes?.owner?.data?.attributes?.username.toLocaleLowerCase() ??
            ''
          }`;
          return textToSearch.includes(searchKey);
        });
  }, [quizzes, searchText]);

  const quizzesCount = searchedQuizzes.length ?? 0;

  const gridItemMinWidth = '280px';
  const gridItemMaxWidth = '1fr';

  return (
    <Box>
      <SearchContextProvider
        searchText={searchText}
        setSearchText={setSearchText}
      >
        <SortContextProvider sort={sort} setSort={setSort}>
          <Box sx={{ marginBottom: 4 }}>
            <FilterBar quizzesCount={quizzesCount} />
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
            {isSuccess &&
              searchedQuizzes.map((quiz) => (
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
              ))}
            {isLoading &&
              Array.from({ length: 6 }).map((_, index) => (
                <QuizOverviewPlaceholder key={index} />
              ))}
          </Box>
          {isSuccess && searchedQuizzes.length === 0 && (
            <Typography>
              No quizzes found. Try changing your search criteria.
            </Typography>
          )}
          {isError && (
            <Alert severity="error">
              An error occurred while loading quizzes
            </Alert>
          )}
        </SortContextProvider>
      </SearchContextProvider>
    </Box>
  );
}
