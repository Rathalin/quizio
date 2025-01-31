import LoginIcon from '@mui/icons-material/Login';
import Button, { type ButtonProps } from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import { useTheme } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';

import { signIn } from 'next-auth/react';
import { useTranslations } from 'next-intl';

type SignInButtonProps = {
  variant?: ButtonProps['variant'];
  color?: ButtonProps['color'];
  sx?: ButtonProps['sx'];
};

export default function SignInButton({ variant, color, sx }: SignInButtonProps) {
  const t = useTranslations('header');
  const theme = useTheme();

  const isSmScreen = useMediaQuery(theme.breakpoints.down('sm'));

  if (isSmScreen) {
    return (
      <IconButton color={color ?? 'primary'} onClick={() => signIn()} sx={sx}>
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
      {t('signInButton.label')}
    </Button>
  );
}
