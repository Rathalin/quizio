import { useMemo } from 'react';
import { useIsMobile } from '@/custom-hooks/useIsMobile';

const imageInput = {
  width: 300,
  height: 200,
} as const;

export function useImageInputDimensions() {
  const isMobile = useIsMobile();

  return useMemo(
    () => ({
      width: isMobile ? imageInput.width * 0.8 : imageInput.width,
      height: isMobile ? imageInput.height * 0.8 : imageInput.height,
    }),
    [isMobile]
  );
}
