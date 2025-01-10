import QuizOverviewCard from '@/components/QuizOverviewCard';
import QuizOverviewPlaceholder from '@/components/QuizOverviewPlaceholder';
import { getAllPublishedQuizzesGQL } from '@/graphql/quizzes';
import { Box, Stack, Typography } from '@mui/material';
import { useInfiniteQuery } from '@tanstack/react-query';
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
import GradientWord from '@/components/GradientWord';
import GradientDivider from '@/components/GradientDivider';
import ScrollObserver from '@/components/ScrollObserver';
import { seconds } from '@/utilities/time';
import { useQuizzesQuery } from '@/queries/useQuizzesQuery';

export default function QuizzesOverview() {
  const { data: session } = useSession();
  const [searchText, setSearchText] = useState('');
  const [sort, setSort] = useStorage(storageKeys.sort, defaultSort);
  const [filters, setFilters] = useStorage<FilterOption[]>(
    storageKeys.filters,
    []
  );
  const composeFilters = useComposeFilters(
    filters,
    { published: { eq: true } },
    session?.user.username
  );
  const gqlFilters = useMemo(() => composeFilters(), [composeFilters]);
  const { data: newQuizzes } = useQuizzesQuery();

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
  } = useInfiniteQuery({
    queryKey: ['allPublishedQuizzes', sort, gqlFilters],
    queryFn: ({ pageParam = 1 }) =>
      request(process.env.NEXT_PUBLIC_GRAPHQL_URL, getAllPublishedQuizzesGQL, {
        sortFields: [`${sort.option}:${sort.mode}`],
        filters: gqlFilters,
        page: pageParam,
        pageSize,
      }),
    getNextPageParam: (lastPage, _pages) => {
      const pagination = lastPage.quizzes?.meta?.pagination;
      if (pagination!.page * pagination!.pageSize < pagination!.total) {
        return pagination!.page + 1;
      }
      return undefined;
    },
    staleTime: seconds(20),
  });

  const quizzes = useMemo(
    () => data?.pages.map((page) => page.quizzes?.data).flat() ?? [],
    [data?.pages]
  );
  const searchedQuizzes = useMemo(() => {
    const searchKey = searchText.trim().toLowerCase();
    return searchText.trim() === ''
      ? quizzes
      : quizzes.filter((quiz) => {
          const textToSearch = `${
            quiz?.attributes?.title?.toLowerCase() ?? ''
          } ${quiz?.attributes?.description?.toLowerCase() ?? ''} ${
            quiz?.attributes?.owner?.data?.attributes?.username.toLocaleLowerCase() ??
            ''
          }`;
          return textToSearch.includes(searchKey);
        });
  }, [quizzes, searchText]);

  const quizzesCount =
    searchText.trim().length > 0
      ? searchedQuizzes.length
      : data?.pages[0]?.quizzes?.meta?.pagination?.total ?? 0;

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
              {newQuizzes != null &&
                newQuizzes.quizzes.map(
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
                      isMyQuiz
                      uuid={uuid}
                      playCount={playCount}
                      published
                      questionCount={questionCount}
                      userUuid={user.uuid}
                      username={user.username}
                    />
                  )
                )}
              {data != null &&
                searchedQuizzes.map((quiz) => (
                  <QuizOverviewCard
                    key={quiz?.attributes?.uuid}
                    uuid={quiz?.attributes?.uuid ?? ''}
                    title={quiz?.attributes?.title ?? ''}
                    description={quiz?.attributes?.description ?? ''}
                    userUuid={
                      quiz?.attributes?.owner?.data?.attributes?.uuid ?? ''
                    }
                    username={
                      quiz?.attributes?.owner?.data?.attributes?.username ?? ''
                    }
                    createdAt={new Date(quiz?.attributes?.createdAt)}
                    published={quiz?.attributes?.published ?? false}
                    questionCount={
                      quiz?.attributes?.questions?.data.length ?? 0
                    }
                    playCount={quiz?.attributes?.playCount ?? 0}
                    imageUrl={quiz?.attributes?.image?.data?.attributes?.url}
                    isMyQuiz={
                      quiz?.attributes?.owner?.data?.attributes?.username ===
                      session?.user.username
                    }
                  />
                ))}
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
