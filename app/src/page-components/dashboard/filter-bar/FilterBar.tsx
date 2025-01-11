import { Stack, useTheme } from '@mui/material';
import IndexAvatar from '../../quiz/game/IndexAvatar';
import SearchInput from './SearchInput';
import SortCreatedButton from './SortButton';
import FilterButton from './FilterButton';
import { useSession } from 'next-auth/react';
import { useSearch } from '../search.context';

type FilterBarProps = {
  quizzesCount: number;
};

export default function FilterBar({ quizzesCount }: FilterBarProps) {
  const theme = useTheme();
  const session = useSession();
  const { searchText } = useSearch();

  return (
    <Stack direction="row" alignItems="center" gap={2} flexWrap="wrap">
      <IndexAvatar
        variant={searchText.trim().length === 0 ? 'rounded' : 'circular'}
        color={theme.palette.primary.main}
        index={quizzesCount}
        sx={{
          width: '2.4rem',
          height: '2.4rem',
          transition: 'border-radius 0.2s ease-in-out',
        }}
      />
      <SearchInput />
      <SortCreatedButton option="createdAt" disabled>
        Created at
      </SortCreatedButton>
      <SortCreatedButton option="playCount" disabled>
        Played
      </SortCreatedButton>
      {session.status === 'authenticated' && (
        <FilterButton filter={'my-quizzes'} disabled>
          My quizzes only
        </FilterButton>
      )}
    </Stack>
  );
}
