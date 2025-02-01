import QuizOverviewCard from '@/components/QuizOverviewCard';
import QuizOverviewPlaceholder from '@/components/QuizOverviewPlaceholder';
import { useMemo, useState } from 'react';
import { SortProvider, defaultSort } from './sort.context';
import FilterBar from './filter-bar/FilterBar';
import { SearchProvider } from './search.context';
import GenericLoadingErrorMessage from '@/components/GenericLoadingErrorMessage';
import { storageKeys } from '@/persistence/storage-keys';
import useStorage from '@/custom-hooks/useStorage';
import GradientText from '@/components/GradientText';
import GradientDivider from '@/components/GradientDivider';
import ScrollObserver from '@/components/ScrollObserver';
import { useQuizzesInfiniteQuery } from '@/data/useQuizzesQuery';
import { GetQuizzesRequestQuery } from '@/api-client';
import { useSession } from 'next-auth/react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Stack from '@mui/material/Stack';
import { useTranslations } from 'next-intl';

export default function QuizzesOverview() {
  const t = useTranslations('dashboard');
  const { data: session } = useSession();
  const [searchText, setSearchText] = useState('');
  const [sort, setSort] = useStorage(storageKeys.sort, defaultSort);

  const placeholderCount = 6;

  const quizzesQueryParams = useMemo<Omit<GetQuizzesRequestQuery, 'page'>>(
    () => ({
      pageSize: 12,
      sort: sort.option,
      sortDirection: sort.mode,
    }),
    [sort.mode, sort.option],
  );
  const { data, isSuccess, isPending, fetchNextPage, isFetchingNextPage, hasNextPage, isError } =
    useQuizzesInfiniteQuery(quizzesQueryParams);

  const quizzes = useMemo(() => data?.pages.map((page) => page.quizzes).flat() ?? [], [data?.pages]);
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
    searchText.trim().length > 0 ? searchedQuizzes.length : (data?.pages.at(0)?.meta.totalItems ?? 0);

  return (
    <Box>
      <SearchProvider searchText={searchText} setSearchText={setSearchText}>
        <SortProvider sort={sort} setSort={setSort}>
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
                ({ uuid, createdAt, title, description, imageUrl, playCount, questionCount, user }) => (
                  <QuizOverviewCard
                    key={uuid}
                    uuid={uuid}
                    title={title}
                    description={description ?? ''}
                    imageUrl={imageUrl}
                    createdAt={new Date(createdAt)}
                    playCount={playCount}
                    questionCount={questionCount}
                    userUuid={user.uuid}
                    username={user.username}
                    isMyQuiz={user.uuid === session?.user.uuid}
                    published
                  />
                ),
              )}
            {(isPending || isFetchingNextPage) &&
              Array.from({ length: placeholderCount }).map((_, index) => <QuizOverviewPlaceholder key={index} />)}
          </Box>
          {isSuccess && searchedQuizzes.length === 0 && <Typography>{t('noResults')}</Typography>}
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
                    {t.rich('noMoreResults', {
                      gradient: (chunks) => <GradientText>{chunks}</GradientText>,
                    })}
                  </Typography>
                </Stack>
              </Stack>
            )}
          </Box>
        </SortProvider>
      </SearchProvider>
    </Box>
  );
}
