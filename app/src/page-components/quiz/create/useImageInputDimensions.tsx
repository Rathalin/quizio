import { useMemo } from 'react';
import { useIsMobile } from '@/custom-hooks/useIsMobile';

const mobileDownscale = 0.6;

const overviewImageInputDimensions = {
  width: 266,
  height: 136,
} as const;

export function useOverviewImageInputDimensions() {
  const isMobile = useIsMobile();

  return useMemo(
    () => ({
      width: isMobile ? overviewImageInputDimensions.width * mobileDownscale : overviewImageInputDimensions.width,
      height: isMobile ? overviewImageInputDimensions.height * mobileDownscale : overviewImageInputDimensions.height,
    }),
    [isMobile],
  );
}

const gameImageInputDimensions = {
  width: 300,
  height: 200,
} as const;

export function useGameImageInputDimensions() {
  const isMobile = useIsMobile();

  return useMemo(
    () => ({
      width: isMobile ? gameImageInputDimensions.width * mobileDownscale : gameImageInputDimensions.width,
      height: isMobile ? gameImageInputDimensions.height * mobileDownscale : gameImageInputDimensions.height,
    }),
    [isMobile],
  );
}
