import { usePageTransition } from '@/stores/page-transition.store';
import { Button, ButtonProps, CircularProgress } from '@mui/material';
import Link from 'next/link';

type LinkButtonProps = {
  hrefObserver: string;
  reason?: string;
  navigateOnClick?: boolean;
  iconSide?: 'left' | 'right';
} & ButtonProps;

export default function LinkButton({
  hrefObserver,
  navigateOnClick = false,
  iconSide = 'left',
  reason,
  children,
  ...props
}: LinkButtonProps) {
  const { transitionHref, transitionReason } = usePageTransition();
  const loading =
    transitionHref === hrefObserver &&
    (reason == null || reason === transitionReason);
  const icon = loading ? (
    <CircularProgress size="1rem" color="loading" />
  ) : null;

  const button = (
    <Button
      startIcon={iconSide === 'left' ? icon : props.startIcon}
      endIcon={iconSide === 'right' ? icon : props.endIcon}
      {...props}
    >
      {children}
    </Button>
  );

  return navigateOnClick ? <Link href={hrefObserver}>{button}</Link> : button;
}
