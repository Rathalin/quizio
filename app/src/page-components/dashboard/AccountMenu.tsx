import {
  AccountCircle as AccountCircleIcon,
  AddCircle,
  AdminPanelSettings,
  Login as LoginIcon,
  Logout as LogoutIcon,
  // Settings as SettingsIcon,
} from '@mui/icons-material';
import {
  Avatar,
  Button,
  Divider,
  IconButton,
  ListItemIcon,
  Menu,
  MenuItem,
  lighten,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import { signIn, signOut, useSession } from 'next-auth/react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useState, type MouseEvent } from 'react';

export default function AccountMenu() {
  const theme = useTheme();
  const router = useRouter();
  const { data: session, status } = useSession();
  const isAuthenticated = status === 'authenticated';

  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
  const open = anchorEl != null;

  const isSmScreen = useMediaQuery(theme.breakpoints.down('sm'));

  function handleClick(event: MouseEvent<HTMLElement>) {
    setAnchorEl(event.currentTarget);
  }

  function handleClose() {
    setAnchorEl(null);
  }

  if (!isAuthenticated || session == null) {
    if (isSmScreen) {
      return (
        <IconButton
          color="primary"
          onClick={() => signIn()}
          aria-label="Sign in"
        >
          <LoginIcon />
        </IconButton>
      );
    }
    return (
      <Button
        variant="outlined"
        endIcon={<LoginIcon />}
        onClick={() => signIn()}
      >
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
          sx={{
            backgroundColor: theme.palette.primary.main,
            color: theme.palette.primary.contrastText,
            fontWeight: '600',
          }}
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
        slotProps={{
          paper: {
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
                backgroundColor: lighten(theme.palette.background.paper, 0.13),
                transform: 'translateY(-50%) rotate(45deg)',
                zIndex: 0,
              },
            },
          },
        }}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
      >
        <Link href="/quiz/create">
          <MenuItem>
            <ListItemIcon>
              <AddCircle />
            </ListItemIcon>
            Create a new quiz
          </MenuItem>
        </Link>
        <Divider />
        <Link href="/users/me">
          <MenuItem onClick={handleClose}>
            <ListItemIcon>
              <AccountCircleIcon />
            </ListItemIcon>
            Profile
          </MenuItem>
        </Link>
        <MenuItem
          onClick={() => {
            handleClose();
            router.push('/users/me/change-password');
          }}
        >
          <ListItemIcon>
            <AdminPanelSettings />
          </ListItemIcon>
          Change Password
        </MenuItem>
        <Divider />
        <MenuItem
          onClick={() => {
            handleClose();
            signOut();
          }}
        >
          <ListItemIcon>
            <LogoutIcon />
          </ListItemIcon>
          Logout
        </MenuItem>
      </Menu>
    </>
  );
}
