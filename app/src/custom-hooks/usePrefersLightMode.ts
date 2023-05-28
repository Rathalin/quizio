import { useMediaQuery } from '@mui/material';

export function usePrefersLightMode() {
  return useMediaQuery('(prefers-color-scheme: light)');
}
