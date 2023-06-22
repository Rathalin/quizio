import { Stack, Typography, useTheme } from '@mui/material';
import IndexAvatar from '../../quiz/game/IndexAvatar';
import SearchInput from './SearchInput';
import SortCreatedButton from './SortButton';
import { useSort } from '../sort.context';

type SearchFilterBarBarProps = {
  filteredQuizzesCount: number;
};

export default function SearchFilterBarBar({
  filteredQuizzesCount,
}: SearchFilterBarBarProps) {
  const theme = useTheme();
  const { sort } = useSort();

  return (
    <Stack>
      <Stack direction="row" alignItems="center" gap={2}>
        <IndexAvatar
          variant="rounded"
          color={theme.palette.primary.main}
          index={filteredQuizzesCount}
          sx={{ width: '2.4rem', height: '2.4rem' }}
        ></IndexAvatar>
        <SearchInput />
        <SortCreatedButton option="created-at">Created at</SortCreatedButton>
      </Stack>
      <Typography variant="overline">
        {sort.option} | {sort.mode}
      </Typography>
    </Stack>
  );
}
