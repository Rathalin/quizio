import { Button } from '@mui/material';
import { FilterOption, useFilter } from '../filter.context';
import { CheckBoxOutlineBlank, CheckBoxOutlined } from '@mui/icons-material';
import { PropsWithChildren } from 'react';

type FilterButtonProps = PropsWithChildren<{
  filter: FilterOption;
}>;

export default function FilterButton({ filter, children }: FilterButtonProps) {
  const { filters, hasFilter, toggleFilter } = useFilter();

  return (
    <Button
      variant="outlined"
      onClick={() => toggleFilter(filter)}
      startIcon={
        hasFilter(filter) ? <CheckBoxOutlined /> : <CheckBoxOutlineBlank />
      }
    >
      {children}
    </Button>
  );
}
