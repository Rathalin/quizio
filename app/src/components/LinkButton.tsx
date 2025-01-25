import { usePageTransition } from '@/persistence/page-transition.store';
import Box from '@mui/material/Box';
import Button, { type ButtonProps } from '@mui/material/Button';

import Link from 'next/link';
import LoadingCircle from './LoadingCircle';

export type LinkButtonProps = {
  hrefObserver: string;
  reason?: string;
  navigateOnClick?: boolean;
  iconSide?: 'left' | 'right';
} & ButtonProps;

export default function LinkButton({
  hrefObserver,
  navigateOnClick = false,
  iconSide = 'right',
  reason,
  children,
  sx,
  ...props
}: LinkButtonProps) {
  const { transitionHref, transitionReason } = usePageTransition();
  const loading = transitionHref === hrefObserver && (reason == null || reason === transitionReason);
  const icon = loading ? <LoadingCircle /> : null;

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
      {navigateOnClick ? (
        <Link href={hrefObserver} className="no-underline">
          {button}
        </Link>
      ) : (
        button
      )}
    </Box>
  );
}
