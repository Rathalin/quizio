import { Button } from '@mui/material';
import { FilterOption, useFilter } from '../filter.context';
import CheckBoxOutlineBlankIcon from '@mui/icons-material/CheckBoxOutlineBlank';
import CheckBoxOutlinedIcon from '@mui/icons-material/CheckBoxOutlined';
import { PropsWithChildren } from 'react';

type FilterButtonProps = PropsWithChildren<{
  filter: FilterOption;
}>;

export default function FilterButton({ filter, children }: FilterButtonProps) {
  const { filter: contextFilter, setFilter: setContextFilter } = useFilter();

  return (
    <Button
      variant="outlined"
      onClick={() =>
        setContextFilter((currentFilter) =>
          currentFilter == 'none' ? filter : 'none'
        )
      }
      startIcon={
        contextFilter === filter ? (
          <CheckBoxOutlinedIcon />
        ) : (
          <CheckBoxOutlineBlankIcon />
        )
      }
    >
      {children}
    </Button>
  );
}
