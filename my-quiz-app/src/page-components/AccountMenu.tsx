import { AccountCircle, Login, Logout, Settings } from '@mui/icons-material';
import {
  Avatar,
  Button,
  Divider,
  IconButton,
  ListItemIcon,
  Menu,
  MenuItem,
} from '@mui/material';
import { signIn, signOut, useSession } from 'next-auth/react';
import { useState, type MouseEvent } from 'react';

export default function AccountMenu() {
  const { data: session, status } = useSession();
  const isAuthenticated = status === 'authenticated';

  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
  const open = anchorEl != null;

  function handleClick(event: MouseEvent<HTMLElement>) {
    setAnchorEl(event.currentTarget);
  }

  function handleClose() {
    setAnchorEl(null);
  }

  if (!isAuthenticated || session == null) {
    return (
      <Button variant="outlined" endIcon={<Login />} onClick={() => signIn()}>
        Sign In
      </Button>
    );
  }

  const initial = session.user.username.at(0)?.toUpperCase();

  return (
    <>
      <IconButton onClick={handleClick}>
        <Avatar
          title={session.user.username}
          sx={{ backgroundColor: 'primary.main', fontWeight: '600' }}
        >
          {initial}
        </Avatar>
      </IconButton>
      <Menu
        id="account-menu"
        anchorEl={anchorEl}
        open={open}
        onClick={handleClose}
        onClose={handleClose}
        PaperProps={{
          sx: {
            overflow: 'visible',
            marginTop: 1,
            minWidth: '16ch',
            '&:before': {
              content: '""',
              display: 'block',
              position: 'absolute',
              top: 0,
              right: 24,
              width: 10,
              height: 10,
              backgroundColor: '#303030e6',
              transform: 'translateY(-50%) rotate(45deg)',
              zIndex: 0,
            },
          },
        }}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
      >
        <MenuItem onClick={handleClose}>
          <ListItemIcon>
            <AccountCircle />
          </ListItemIcon>
          Profile
        </MenuItem>
        <Divider />
        <MenuItem onClick={handleClose}>
          <ListItemIcon>
            <Settings />
          </ListItemIcon>
          Settings
        </MenuItem>
        <MenuItem
          onClick={() => {
            handleClose();
            signOut();
          }}
        >
          <ListItemIcon>
            <Logout />
          </ListItemIcon>
          Logout
        </MenuItem>
      </Menu>
    </>
  );
}
