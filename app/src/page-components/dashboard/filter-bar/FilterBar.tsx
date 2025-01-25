import IndexAvatar from '../../quiz/game/IndexAvatar';
import SearchInput from './SearchInput';
import SortButton from './SortButton';
import { useSearch } from '../search.context';
import { useTheme } from '@mui/material/styles';
import Stack from '@mui/material/Stack';

type FilterBarProps = {
  quizzesCount: number;
};

export default function FilterBar({ quizzesCount }: FilterBarProps) {
  const theme = useTheme();
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
      <SortButton option="createdAt">Created at</SortButton>
      <SortButton option="playCount">Played</SortButton>
      {/* {session.status === 'authenticated' && (
        <FilterButton filter="myQuizzes">Created by me</FilterButton>
      )} */}
    </Stack>
  );
}
