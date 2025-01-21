import { Button } from '@mui/material';
import { SortOption, useSort } from '../sort.context';
import { PropsWithChildren, useMemo } from 'react';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';

type SortButtonProps = PropsWithChildren<{
  option: SortOption;
}>;

export default function SortButton({ option, children }: SortButtonProps) {
  const { sortOption, sortMode, setSortOption, setSortMode, toggleSortMode } =
    useSort();

  const icon = useMemo(() => {
    if (sortOption !== option) {
      return null;
    }
    if (sortMode === 'asc') {
      return <ArrowDownwardIcon />;
    }
    return <ArrowUpwardIcon />;
  }, [option, sortMode, sortOption]);

  function handleClick() {
    setSortOption(option);
    if (sortOption === option) {
      toggleSortMode();
    } else {
      setSortMode('desc');
    }
  }

  return (
    <Button variant="outlined" endIcon={icon} onClick={handleClick}>
      {children}
    </Button>
  );
}
