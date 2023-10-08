import { Login as LoginIcon } from '@mui/icons-material';
import {
  Button,
  ButtonProps,
  IconButton,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import { signIn } from 'next-auth/react';

type SignInButtonProps = {
  variant?: ButtonProps['variant'];
  color?: ButtonProps['color'];
  sx?: ButtonProps['sx'];
};

export default function SignInButton({
  variant,
  color,
  sx,
}: SignInButtonProps) {
  const theme = useTheme();

  const isSmScreen = useMediaQuery(theme.breakpoints.down('sm'));

  if (isSmScreen) {
    return (
      <IconButton
        color={color ?? 'primary'}
        onClick={() => signIn()}
        aria-label="Sign in"
        sx={sx}
      >
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
