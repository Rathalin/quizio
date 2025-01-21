import SignInButton from '@/components/buttons/SignInButton';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import AddCircleIcon from '@mui/icons-material/AddCircle';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import LogoutIcon from '@mui/icons-material/Logout';
import {
  Avatar,
  Divider,
  IconButton,
  ListItemIcon,
  Menu,
  MenuItem,
  lighten,
  useTheme,
} from '@mui/material';
import { signOut, useSession } from 'next-auth/react';
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

  function handleClick(event: MouseEvent<HTMLElement>) {
    setAnchorEl(event.currentTarget);
  }

  function handleClose() {
    setAnchorEl(null);
  }

  if (router.pathname === '/auth/signin' && !isAuthenticated) {
    return null;
  }

  if (!isAuthenticated || session == null) {
    return <SignInButton />;
  }

  const initial = session.user?.username?.at(0)?.toUpperCase() ?? '';

  return (
    <>
      <IconButton onClick={handleClick}>
        <Avatar
          title={'123'} //session.username
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
        <Link href="/quiz/create" className="no-underline">
          <MenuItem>
            <ListItemIcon>
              <AddCircleIcon />
            </ListItemIcon>
            Create a new quiz
          </MenuItem>
        </Link>
        <Divider />
        <Link href="/users/me" className="no-underline">
          <MenuItem onClick={handleClose}>
            <ListItemIcon>
              <AccountCircleIcon />
            </ListItemIcon>
            Profile
          </MenuItem>
        </Link>
        <Link href="/users/me/change-password" className="no-underline">
          <MenuItem onClick={handleClose}>
            <ListItemIcon>
              <AdminPanelSettingsIcon />
            </ListItemIcon>
            Change Password
          </MenuItem>
        </Link>
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
