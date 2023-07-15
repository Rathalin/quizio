import GenericLoadingErrorMessage from '@/components/GenericLoadingErrorMessage';
import LinkButton from '@/components/LinkButton';
import { Box, Typography } from '@mui/material';

export default function InternalServerErrorPage() {
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
        <Typography variant="h1">
          <GenericLoadingErrorMessage />
        </Typography>
        <Box sx={{ display: 'flex', justifyContent: 'center' }}>
          <LinkButton
            hrefObserver="/"
            navigateOnClick
            variant="contained"
            iconSide="left"
          >
            Home
          </LinkButton>
        </Box>
      </Box>
    </Box>
  );
}
