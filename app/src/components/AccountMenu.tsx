import SignInButton from '@/components/buttons/SignInButton';
import { useUserAccountQuery } from '@/data/useUserAccountQuery';
import { raise } from '@/utilities/errorHandling';
import { prefixWithBackendUrl } from '@/utilities/urlUtils';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import LogoutIcon from '@mui/icons-material/Logout';
import Avatar from '@mui/material/Avatar';
import Divider from '@mui/material/Divider';
import IconButton from '@mui/material/IconButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import { lighten, useTheme } from '@mui/material/styles';
import { signOut, useSession } from 'next-auth/react';
import { useTranslations } from 'next-intl';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useState, type MouseEvent } from 'react';
import ViewAgendaIcon from '@mui/icons-material/ViewAgenda';

export default function AccountMenu() {
  const t = useTranslations('header.accountMenu');
  const theme = useTheme();
  const router = useRouter();
  const { data: session, status } = useSession();
  const { data: user, isSuccess: isUserSuccess } = useUserAccountQuery();

  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
  const open = anchorEl != null;

  function handleClick(event: MouseEvent<HTMLElement>) {
    setAnchorEl(event.currentTarget);
  }

  function handleClose() {
    setAnchorEl(null);
  }

  if (status == 'loading' || (router.pathname === '/auth/signin' && status == 'unauthenticated')) {
    return null;
  }

  if (status === 'unauthenticated' || session == null) {
    return <SignInButton />;
  }

  // Show null if userAccountQuery is still pending
  if (!isUserSuccess) {
    return null;
  }

  const initial =
    user.username.at(0)?.toUpperCase() ??
    raise('Cannot display initials in account menu because user.username is empty');

  return (
    <>
      <IconButton onClick={handleClick}>
        {user.profileImageUrl != null ? (
          <Avatar
            alt={`Profile image of ${user.username}`}
            src={prefixWithBackendUrl(user.profileImageUrl)}
            sx={{ borderColor: 'primary.dark', borderStyle: 'solid', borderWidth: '2px' }}
          />
        ) : (
          <Avatar
            sx={{
              backgroundColor: theme.palette.primary.main,
              color: theme.palette.primary.contrastText,
              fontWeight: '600',
            }}
          >
            {initial}
          </Avatar>
        )}
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
        <Link href="/my-quizzes" className="no-underline">
          <MenuItem onClick={handleClose}>
            <ListItemIcon>
              <ViewAgendaIcon />
            </ListItemIcon>
            {t('menu.item.myQuizzes')}
          </MenuItem>
        </Link>
        <Divider />
        <Link href="/users/me" className="no-underline">
          <MenuItem onClick={handleClose}>
            <ListItemIcon>
              <AccountCircleIcon />
            </ListItemIcon>
            {t('menu.item.profile')}
          </MenuItem>
        </Link>
        <Link href="/users/me/change-password" className="no-underline">
          <MenuItem onClick={handleClose}>
            <ListItemIcon>
              <AdminPanelSettingsIcon />
            </ListItemIcon>
            {t('menu.item.changePassword')}
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
          {t('menu.item.signOut')}
        </MenuItem>
      </Menu>
    </>
  );
}
