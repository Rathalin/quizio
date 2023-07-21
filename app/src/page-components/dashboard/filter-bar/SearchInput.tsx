import QuizioTextField from '@/components/inputs/QuizioTextField';
import { Clear as ClearIcon, Search as SearchIcon } from '@mui/icons-material';
import { InputAdornment, IconButton, debounce } from '@mui/material';
import { useSearch } from '../search.context';
import { useEffect, useMemo, useState } from 'react';
import { useIsMobile } from '@/custom-hooks/useIsMobile';

const debounceTime = 300;

export default function SearchInput() {
  const isMobile = useIsMobile();
  const { searchText, setSearchText } = useSearch();
  const [inputValue, setInputValue] = useState('');

  const searchDebounce = useMemo(
    () =>
      debounce((newValue: string) => {
        setSearchText(newValue);
      }, debounceTime),
    [setSearchText]
  );

  useEffect(() => {
    searchDebounce(inputValue);
  }, [searchDebounce, inputValue]);

  return (
    <QuizioTextField
      value={inputValue}
      placeholder="Search quizzes"
      onChange={(e) => setInputValue(e.target.value)}
      size="small"
      sx={{ marginTop: '2px', width: isMobile ? '230px' : 'auto' }}
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
              onClick={() => setInputValue('')}
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
