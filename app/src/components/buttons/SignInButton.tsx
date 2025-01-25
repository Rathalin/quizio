import LoginIcon from '@mui/icons-material/Login';
import Button, { type ButtonProps } from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import { useTheme } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';

import { signIn } from 'next-auth/react';

type SignInButtonProps = {
  variant?: ButtonProps['variant'];
  color?: ButtonProps['color'];
  sx?: ButtonProps['sx'];
};

export default function SignInButton({ variant, color, sx }: SignInButtonProps) {
  const theme = useTheme();

  const isSmScreen = useMediaQuery(theme.breakpoints.down('sm'));

  if (isSmScreen) {
    return (
      <IconButton color={color ?? 'primary'} onClick={() => signIn()} aria-label="Sign in" sx={sx}>
        <LoginIcon />
      </IconButton>
    );
  }
  return (
    <Button
      variant={variant ?? 'outlined'}
      color={color ?? 'primary'}
      endIcon={<LoginIcon />}
      onClick={() => signIn()}
      sx={sx}
    >
      Sign In
    </Button>
  );
}
