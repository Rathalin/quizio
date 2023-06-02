import { usePageTransition } from '@/stores/page-transition.store';
import { Box, Button, ButtonProps, CircularProgress } from '@mui/material';
import Link from 'next/link';

export type LinkButtonProps = {
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
  sx,
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

  return (
    <Box sx={sx}>
      {navigateOnClick ? <Link href={hrefObserver}>{button}</Link> : button}
    </Box>
  );
}
