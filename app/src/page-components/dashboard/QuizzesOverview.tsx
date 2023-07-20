import QuizOverview from '@/components/QuizOverview';
import QuizOverviewPlaceholder from '@/components/QuizOverviewPlaceholder';
import { getAllPublishedQuizzesGQL } from '@/graphql/quizzes';
import { Box, Typography } from '@mui/material';
import { useQuery } from '@tanstack/react-query';
import request from 'graphql-request';
import { useSession } from 'next-auth/react';
import { useMemo, useState } from 'react';
import { SortProvider, defaultSort } from './sort.context';
import FilterBar from './filter-bar/FilterBar';
import { SearchProvider } from './search.context';
import {
  FilterOption,
  FilterProvider,
  useComposeFilters,
} from './filter.context';
import GenericLoadingErrorMessage from '@/components/GenericLoadingErrorMessage';
import { storageKeys } from '@/persistence/storage-keys';
import useStorage from '@/custom-hooks/useStorage';

export default function QuizzesOverview() {
  const { data: session } = useSession();
  const [searchText, setSearchText] = useState('');
  const [sort, setSort] = useStorage(storageKeys.sort, defaultSort);
  const [filters, setFilters] = useState<Set<FilterOption>>(new Set());
  const composeFilters = useComposeFilters(filters, session?.user.username);
  const gqlFilters = useMemo(() => composeFilters(), [composeFilters]);

  const { data, isSuccess, isLoading, isError } = useQuery({
    queryKey: ['allPublishedQuizzes', sort, gqlFilters],
    queryFn: () =>
      request(process.env.NEXT_PUBLIC_GRAPHQL_URL, getAllPublishedQuizzesGQL, {
        sortFields: [`${sort.option}:${sort.mode}`],
        filters: gqlFilters,
      }),
    staleTime: 1000 * 30,
  });

  const quizzes = useMemo(
    () => data?.quizzes?.data ?? [],
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

  const quizzesCount = searchedQuizzes.length;

  return (
    <Box>
      <SearchProvider searchText={searchText} setSearchText={setSearchText}>
        <SortProvider sort={sort} setSort={setSort}>
          <FilterProvider filters={filters} setFilters={setFilters}>
            <Box sx={{ marginBottom: 4 }}>
              <FilterBar quizzesCount={quizzesCount} />
            </Box>
            <Box
              sx={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
                columnGap: {
                  xs: 6,
                },
                rowGap: {
                  xs: 8,
                  md: 6,
                },
              }}
            >
              {data != null &&
                searchedQuizzes.map((quiz) => (
                  <QuizOverview
                    key={quiz.attributes?.uuid}
                    uuid={quiz.attributes?.uuid ?? ''}
                    title={quiz.attributes?.title ?? ''}
                    description={quiz.attributes?.description ?? ''}
                    userUuid={
                      quiz.attributes?.owner?.data?.attributes?.uuid ?? ''
                    }
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
                {'No quizzes found. Try changing your search criteria.'}
              </Typography>
            )}
            {isError && <GenericLoadingErrorMessage />}
          </FilterProvider>
        </SortProvider>
      </SearchProvider>
    </Box>
  );
}
