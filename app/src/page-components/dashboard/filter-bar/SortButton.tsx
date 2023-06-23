import {
  ArrowDownward as ArrowDownwardIcon,
  ArrowUpward as ArrowUpwardIcon,
} from '@mui/icons-material';
import { Button } from '@mui/material';
import { SortOption, useSort } from '../sort.context';
import { PropsWithChildren, useMemo } from 'react';

type SortButtonProps = PropsWithChildren<{ option: SortOption }>;

export default function SortButton({ option, children }: SortButtonProps) {
  const { sort, setSort, toggleSortMode, setSortOption } = useSort();

  const icon = useMemo(() => {
    if (sort.option !== option) {
      return null;
    }
    if (sort.mode === 'asc') {
      return <ArrowDownwardIcon />;
    }
    return <ArrowUpwardIcon />;
  }, [option, sort.mode, sort.option]);

  function handleClick() {
    setSortOption(option);
    toggleSortMode();
  }

  return (
    <Button variant="outlined" endIcon={icon} onClick={handleClick}>
      {children}
    </Button>
  );
}
