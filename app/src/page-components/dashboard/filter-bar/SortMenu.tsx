import Button from '@mui/material/Button';
import List from '@mui/material/List';
import ListItemButton, { ListItemButtonProps } from '@mui/material/ListItemButton';
import Menu from '@mui/material/Menu';
import { useState, MouseEvent } from 'react';
import { Sort, useSort } from '../sort.context';
import SortIcon from '@mui/icons-material/Sort';
import Stack from '@mui/material/Stack';
import Box from '@mui/material/Box';

export function SortMenu() {
  const { sort, setSort } = useSort();

  const [anchorEl, setAnchorEl] = useState<HTMLButtonElement | null>(null);

  function handleClick(event: MouseEvent<HTMLButtonElement>) {
    setAnchorEl(event.currentTarget);
  }

  function handleClose() {
    setAnchorEl(null);
  }

  function setSortAndClose(sort: Sort) {
    setSort(sort);
    handleClose();
  }

  const sortLabels = {
    'createdAt-desc': 'latest',
    'createdAt-asc': 'oldest',
    'playCount-desc': 'most played',
    'playCount-asc': 'least played',
  } as const;

  const open = Boolean(anchorEl);
  const id = open ? 'filter-menu' : undefined;

  return (
    <>
      <Button aria-describedby={id} variant="outlined" onClick={handleClick} startIcon={<SortIcon />}>
        <Stack direction="row" gap={1}>
          <Box component="span" sx={{ fontWeight: 400 }}>
            {'Sort by'}
          </Box>
          <Box component="span" sx={{ fontWeight: 800 }}>
            {sortLabels[`${sort.option}-${sort.mode}`]}
          </Box>
        </Stack>
      </Button>
      <Menu
        id={id}
        open={open}
        anchorEl={anchorEl}
        onClose={handleClose}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'left',
        }}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'left',
        }}
      >
        <List>
          <SortItemButton onClick={() => setSortAndClose({ option: 'createdAt', mode: 'desc' })}>
            {sortLabels['createdAt-desc']}
          </SortItemButton>
          <SortItemButton onClick={() => setSortAndClose({ option: 'createdAt', mode: 'asc' })}>
            {sortLabels['createdAt-asc']}
          </SortItemButton>
          <SortItemButton onClick={() => setSortAndClose({ option: 'playCount', mode: 'desc' })}>
            {sortLabels['playCount-desc']}
          </SortItemButton>
          <SortItemButton onClick={() => setSortAndClose({ option: 'playCount', mode: 'asc' })}>
            {sortLabels['playCount-asc']}
          </SortItemButton>
        </List>
      </Menu>
    </>
  );
}

type SortItemButtonProps = ListItemButtonProps;

function SortItemButton({ children, ...other }: SortItemButtonProps) {
  return (
    <ListItemButton
      sx={{
        textTransform: 'capitalize',
      }}
      {...other}
    >
      {children}
    </ListItemButton>
  );
}
