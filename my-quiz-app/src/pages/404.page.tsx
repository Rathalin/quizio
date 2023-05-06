import LinkButton from '@/components/LinkButton';
import { Box, Typography } from '@mui/material';

export default function NotFoundPage() {
  return (
    <Box
      sx={{
        height: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <Box>
        <Typography variant="h1">This page does not exist.</Typography>
        <Box sx={{ display: 'flex', justifyContent: 'center' }}>
          <LinkButton hrefObserver="/" navigateOnClick variant="contained">
            Home
          </LinkButton>
        </Box>
      </Box>
    </Box>
  );
}
