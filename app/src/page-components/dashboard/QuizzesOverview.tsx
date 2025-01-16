import QuizOverviewCard from '@/components/QuizOverviewCard';
import QuizOverviewPlaceholder from '@/components/QuizOverviewPlaceholder';
import { Box, Stack, Typography } from '@mui/material';
import { useMemo, useState } from 'react';
import { SortProvider, defaultSort } from './sort.context';
import FilterBar from './filter-bar/FilterBar';
import { SearchProvider } from './search.context';
import { FilterOption, FilterProvider } from './filter.context';
import GenericLoadingErrorMessage from '@/components/GenericLoadingErrorMessage';
import { storageKeys } from '@/persistence/storage-keys';
import useStorage from '@/custom-hooks/useStorage';
import GradientWord from '@/components/GradientWord';
import GradientDivider from '@/components/GradientDivider';
import ScrollObserver from '@/components/ScrollObserver';
import { useQuizzesInfiniteQuery } from '@/data/useQuizzesQuery';
import { useSession } from 'next-auth/react';

export default function QuizzesOverview() {
  const { data: session } = useSession();
  const [searchText, setSearchText] = useState('');
  const [sort, setSort] = useStorage(storageKeys.sort, defaultSort);
  const [filters, setFilters] = useStorage<FilterOption[]>(
    storageKeys.filters,
    []
  );
  // const composeFilters = useComposeFilters(
  //   filters,
  //   { published: { eq: true } },
  //   session?.user.username
  // );
  // const gqlFilters = useMemo(() => composeFilters(), [composeFilters]);

  const pageSize = 12;
  const placeholderCount = 6;

  const {
    data,
    isSuccess,
    isLoading,
    fetchNextPage,
    isFetchingNextPage,
    hasNextPage,
    isError,
  } = useQuizzesInfiniteQuery(pageSize);

  const quizzes = useMemo(
    () => data?.pages.map((page) => page.quizzes).flat() ?? [],
    [data?.pages]
  );
  const searchedQuizzes = useMemo(() => {
    const searchKey = searchText.trim().toLowerCase();
    return searchText.trim() === ''
      ? quizzes
      : quizzes.filter((quiz) => {
          const textToSearch = `${quiz.title.toLowerCase()} ${
            quiz.description?.toLowerCase() ?? ''
          } ${quiz.user.username.toLocaleLowerCase()}`;
          return textToSearch.includes(searchKey);
        });
  }, [quizzes, searchText]);

  const quizzesCount =
    searchText.trim().length > 0
      ? searchedQuizzes.length
      : data?.pages.at(0)?.meta.totalItems ?? 0;

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
                searchedQuizzes.map(
                  ({
                    uuid,
                    createdAt,
                    title,
                    description,
                    playCount,
                    questionCount,
                    user,
                  }) => (
                    <QuizOverviewCard
                      key={uuid}
                      createdAt={new Date(createdAt)}
                      title={title}
                      description={description ?? ''}
                      uuid={uuid}
                      playCount={playCount}
                      published
                      questionCount={questionCount}
                      userUuid={user.uuid}
                      username={user.username}
                      // isMyQuiz={user.uuid === session?.user.uuid}
                      isMyQuiz // TODO Sessions
                    />
                  )
                )}
              {(isLoading || isFetchingNextPage) &&
                Array.from({ length: placeholderCount }).map((_, index) => (
                  <QuizOverviewPlaceholder key={index} />
                ))}
            </Box>
            {isSuccess && searchedQuizzes.length === 0 && (
              <Typography>
                {'No quizzes found. Try changing your search criteria.'}
              </Typography>
            )}
            {isError && <GenericLoadingErrorMessage />}
            <Box sx={{ marginTop: 8 }}>
              {hasNextPage && !isFetchingNextPage ? (
                <ScrollObserver
                  onIntersect={() => {
                    fetchNextPage();
                  }}
                />
              ) : (
                <Stack gap={2}>
                  <GradientDivider />
                  <Stack direction="row" justifyContent="center">
                    <Typography>
                      <span>{'No more '}</span>
                      <GradientWord>{'quizzes'}</GradientWord>
                      <span>{' to load.'}</span>
                    </Typography>
                  </Stack>
                </Stack>
              )}
            </Box>
          </FilterProvider>
        </SortProvider>
      </SearchProvider>
    </Box>
  );
}
