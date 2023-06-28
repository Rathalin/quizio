import { Stack, useTheme } from '@mui/material';
import IndexAvatar from '../../quiz/game/IndexAvatar';
import SearchInput from './SearchInput';
import SortCreatedButton from './SortButton';
import { useSort } from '../sort.context';

type FilterBarProps = {
  quizzesCount: number;
};

export default function FilterBar({ quizzesCount }: FilterBarProps) {
  const theme = useTheme();
  const { sort } = useSort();

  return (
    <Stack direction="row" alignItems="center" gap={2} flexWrap="wrap">
      <IndexAvatar
        variant="rounded"
        color={theme.palette.primary.main}
        index={quizzesCount}
        sx={{ width: '2.4rem', height: '2.4rem' }}
      ></IndexAvatar>
      <SearchInput />
      <SortCreatedButton option="createdAt">Created at</SortCreatedButton>
      <SortCreatedButton option="playCount">Played</SortCreatedButton>
    </Stack>
  );
}
