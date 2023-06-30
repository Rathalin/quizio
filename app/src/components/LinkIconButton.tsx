import { usePageTransition } from '@/stores/page-transition.store';
import { Box, IconButton, IconButtonProps } from '@mui/material';
import LoadingCircle from './LoadingCircle';
import Link from 'next/link';

export type LinkIconButtonProps = {
  hrefObserver: string;
  reason?: string;
  navigateOnClick?: boolean;
  iconSide?: 'left' | 'right';
} & IconButtonProps;
export default function LinkIconButton({
  hrefObserver,
  navigateOnClick = false,
  reason,
  children,
  sx,
  ...props
}: LinkIconButtonProps) {
  const { transitionHref, transitionReason } = usePageTransition();
  const loading =
    transitionHref === hrefObserver &&
    (reason == null || reason === transitionReason);

  const button = (
    <IconButton {...props}>
      {loading ? (
        <LoadingCircle color="secondary" size="1.5rem" thickness={5} />
      ) : (
        children
      )}
    </IconButton>
  );

  return (
    <Box sx={sx}>
      {navigateOnClick ? <Link href={hrefObserver}>{button}</Link> : button}
    </Box>
  );
}
