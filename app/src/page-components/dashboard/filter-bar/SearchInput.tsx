import QuizioTextField from '@/components/inputs/QuizioTextField';
import { useSearch } from '../search.context';
import { useEffect, useMemo, useState } from 'react';
import { useIsMobile } from '@/custom-hooks/useIsMobile';
import SearchIcon from '@mui/icons-material/Search';
import ClearIcon from '@mui/icons-material/Clear';
import InputAdornment from '@mui/material/InputAdornment';
import IconButton from '@mui/material/IconButton';
import { debounce } from '@mui/material/utils';
import { useTranslations } from 'next-intl';

const debounceTime = 300;

export default function SearchInput() {
  const t = useTranslations('dashboard.searchAndFilter.search');
  const isMobile = useIsMobile();
  const { searchText, setSearchText } = useSearch();
  const [inputValue, setInputValue] = useState('');

  const searchDebounce = useMemo(
    () =>
      debounce((newValue: string) => {
        setSearchText(newValue);
      }, debounceTime),
    [setSearchText],
  );

  useEffect(() => {
    searchDebounce(inputValue);
  }, [searchDebounce, inputValue]);

  return (
    <QuizioTextField
      value={inputValue}
      placeholder={t('placeholder')}
      onChange={(e) => setInputValue(e.target.value)}
      size="small"
      sx={{ marginTop: '2px', width: isMobile ? '230px' : 'auto' }}
      slotProps={{
        input: {
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
        },
      }}
    />
  );
}
