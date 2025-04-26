import IndexAvatar from '../../quiz/game/IndexAvatar';
import SearchInput from './SearchInput';
import { useSearch } from '../search.context';
import Stack from '@mui/material/Stack';
import { SortMenu } from './SortMenu';

type FilterBarProps = {
  quizzesCount: number;
};

export default function FilterBar({ quizzesCount }: FilterBarProps) {
  const { searchText } = useSearch();

  return (
    <Stack direction="row" alignItems="center" gap={2} flexWrap="wrap">
      <IndexAvatar
        variant={searchText.trim().length === 0 ? 'rounded' : 'circular'}
        color="primary.main"
        index={quizzesCount}
        sx={{
          width: '2.4rem',
          height: '2.4rem',
          transition: 'border-radius 0.2s ease-in-out',
        }}
      />
      <SearchInput />
      <SortMenu />
    </Stack>
  );
}
