import { Button } from '@mui/material';
import { FilterOption, useFilter } from '../filter.context';
import CheckBoxOutlineBlankIcon from '@mui/icons-material/CheckBoxOutlineBlank';
import CheckBoxOutlinedIcon from '@mui/icons-material/CheckBoxOutlined';
import { PropsWithChildren } from 'react';

type FilterButtonProps = PropsWithChildren<{
  filter: FilterOption;
  disabled: boolean;
}>;

export default function FilterButton({
  filter,
  disabled,
  children,
}: FilterButtonProps) {
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
      disabled={disabled}
    >
      {children}
    </Button>
  );
}
