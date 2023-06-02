import { useMediaQuery, useTheme } from '@mui/material';

export function useIsMobile() {
  const theme = useTheme();
  return useMediaQuery(`(max-width: ${theme.breakpoints.values.sm}px)`);
}
