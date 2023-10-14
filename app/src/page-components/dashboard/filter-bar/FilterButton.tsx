import { Button } from '@mui/material';
import { FilterOption, useFilter } from '../filter.context';
import CheckBoxOutlineBlankIcon from '@mui/icons-material/CheckBoxOutlineBlank';
import CheckBoxOutlinedIcon from '@mui/icons-material/CheckBoxOutlined';
import { PropsWithChildren } from 'react';

type FilterButtonProps = PropsWithChildren<{
  filter: FilterOption;
}>;

export default function FilterButton({ filter, children }: FilterButtonProps) {
  const { hasFilter, toggleFilter } = useFilter();

  return (
    <Button
      variant="outlined"
      onClick={() => toggleFilter(filter)}
      startIcon={
        hasFilter(filter) ? (
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
