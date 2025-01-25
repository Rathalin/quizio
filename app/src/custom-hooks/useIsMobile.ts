import { useTheme } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';

export function useIsMobile() {
  const theme = useTheme();
  return useMediaQuery(`(max-width: ${theme.breakpoints.values.sm}px)`);
}
