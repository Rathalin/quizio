import QuizioTextField from '@/components/inputs/QuizioTextField';
import { Clear, Search as SearchIcon } from '@mui/icons-material';
import { IconButton, InputAdornment, Stack, useTheme } from '@mui/material';
import { Dispatch, SetStateAction } from 'react';
import IndexAvatar from './quiz/game/IndexAvatar';

type QuizzesFilterBarProps = {
  searchText: string;
  setSearchText: Dispatch<SetStateAction<string>>;
  filteredQuizzesCount: number;
};

export default function QuizzesFilterBar({
  searchText,
  setSearchText,
  filteredQuizzesCount,
}: QuizzesFilterBarProps) {
  const theme = useTheme();

  return (
    <Stack direction="row" alignItems="center" gap={2}>
      <IndexAvatar
        variant="rounded"
        color={theme.palette.primary.main}
        index={filteredQuizzesCount}
        sx={{ width: '2.4rem', height: '2.4rem' }}
      ></IndexAvatar>
      <QuizioTextField
        value={searchText}
        onChange={(e) => setSearchText(e.target.value)}
        size="small"
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <SearchIcon />
            </InputAdornment>
          ),
          endAdornment: (
            <InputAdornment position="end">
              <IconButton
                size="small"
                onClick={() => setSearchText('')}
                sx={{
                  visibility: searchText.length === 0 ? 'hidden' : 'visible',
                }}
              >
                <Clear />
              </IconButton>
            </InputAdornment>
          ),
        }}
      />
    </Stack>
  );
}
