import {
  ArrowDownward as ArrowDownwardIcon,
  ArrowUpward as ArrowUpwardIcon,
} from '@mui/icons-material';
import { Button } from '@mui/material';
import { SortOption, useSort } from '../sort.context';
import { PropsWithChildren, useMemo } from 'react';

type SortButtonProps = PropsWithChildren<{ option: SortOption }>;

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
    if (sortOption === option) {
      toggleSortMode();
    } else {
      setSortMode('desc');
    }
    setSortOption(option);
  }

  return (
    <Button variant="outlined" endIcon={icon} onClick={handleClick}>
      {children}
    </Button>
  );
}
