import LoginIcon from '@mui/icons-material/Login';
import { type ButtonProps } from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import { useTheme } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';

import { useTranslations } from 'next-intl';
import Link from 'next/link';
import { useRouter } from 'next/router';
import LinkButton from '../LinkButton';
import { Route } from 'next';

type SignInButtonProps = {
  variant?: ButtonProps['variant'];
  color?: ButtonProps['color'];
  sx?: ButtonProps['sx'];
};

export default function SignInButton({ variant, color, sx }: SignInButtonProps) {
  const t = useTranslations('header');
  const theme = useTheme();
  const router = useRouter();

  const href = `/auth/signin?callbackUrl=${encodeURIComponent(router.asPath)}`;

  const isSmScreen = useMediaQuery(theme.breakpoints.down('sm'));

  return isSmScreen ? (
    <IconButton color={color ?? 'primary'} LinkComponent={Link} href={href} sx={sx}>
      <LoginIcon />
    </IconButton>
  ) : (
    <LinkButton
      variant={variant ?? 'outlined'}
      color={color ?? 'primary'}
      startIcon={<LoginIcon />}
      hrefObserver={href as Route}
      navigateOnClick
      sx={sx}
    >
      {t('signInButton.label')}
    </LinkButton>
  );
}
