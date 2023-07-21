import QuizOverview from '@/components/QuizOverview';
import QuizOverviewPlaceholder from '@/components/QuizOverviewPlaceholder';
import { getAllPublishedQuizzesGQL } from '@/graphql/quizzes';
import { Box, Button, Stack, Typography } from '@mui/material';
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
import LoadingCircle from '@/components/LoadingCircle';
import GradientWord from '@/components/GradientWord';
import GradientDivider from '@/components/GradientDivider';

export default function QuizzesOverview() {
  const { data: session } = useSession();
  const [searchText, setSearchText] = useState('');
  const [sort, setSort] = useStorage(storageKeys.sort, defaultSort);
  const [filters, setFilters] = useStorage<FilterOption[]>(
    storageKeys.filters,
    []
  );
  const composeFilters = useComposeFilters(filters, session?.user.username);
  const gqlFilters = useMemo(() => composeFilters(), [composeFilters]);

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
        pageSize: 12,
      }),
    getNextPageParam: (lastPage, pages) => {
      const pagination = lastPage.quizzes?.meta?.pagination;
      if (pagination!.page * pagination!.pageSize < pagination!.total) {
        return pagination!.page + 1;
      }
      return undefined;
    },
    staleTime: 1000 * 30,
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
            <Box sx={{ marginTop: 8 }}>
              {hasNextPage ? (
                <Stack direction="row" justifyContent="center">
                  <Button
                    variant="contained"
                    color="secondary"
                    onClick={() => fetchNextPage()}
                    disabled={isFetchingNextPage}
                    startIcon={isFetchingNextPage ? <LoadingCircle /> : null}
                  >
                    {'Load more quizzes'}
                  </Button>
                </Stack>
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
