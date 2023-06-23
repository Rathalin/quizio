import QuizioTextField from '@/components/inputs/QuizioTextField';
import { Clear as ClearIcon, Search as SearchIcon } from '@mui/icons-material';
import { InputAdornment, IconButton } from '@mui/material';
import { useSearch } from '../search.context';

export default function SearchInput() {
  const { searchText, setSearchText } = useSearch();

  return (
    <QuizioTextField
      value={searchText}
      placeholder="Search quizzes"
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
              <ClearIcon />
            </IconButton>
          </InputAdornment>
        ),
      }}
    />
  );
}
