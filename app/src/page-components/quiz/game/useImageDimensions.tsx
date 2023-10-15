import { useMemo } from 'react';
import { useMediaQuery, useTheme } from '@mui/material';

const image = {
  width: 600,
  height: 400,
} as const;

const lgMultiplier = 0.8;
const mdMultiplier = 0.7;
const smMultiplier = 0.4;

export function useImageDimensions() {
  const theme = useTheme();
  const isLg = useMediaQuery(`(max-width: ${theme.breakpoints.values.lg}px)`);
  const isMd = useMediaQuery(`(max-width: ${theme.breakpoints.values.md}px)`);
  const isSm = useMediaQuery(`(max-width: ${theme.breakpoints.values.sm}px)`);

  return useMemo(() => {
    const multiplier = isSm
      ? smMultiplier
      : isMd
      ? mdMultiplier
      : isLg
      ? lgMultiplier
      : 1.0;
    return {
      width: image.width * multiplier,
      height: image.height * multiplier,
    };
  }, [isLg, isMd, isSm]);
}
