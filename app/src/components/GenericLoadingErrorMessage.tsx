import { Alert, Box } from '@mui/material';
import Link from 'next/link';

export default function GenericLoadingErrorMessage() {
  return (
    <Alert severity="error" sx={{ marginTop: 2 }}>
      <Box component="span">
        {
          'Sorry, the Quizio services are currently unavailable. If the error persists, contact '
        }
      </Box>
      <Link
        href="mailto:daniel@flockert.at"
        style={{ fontWeight: 700 }}
        className="no-underline"
      >
        daniel@flockert.at
      </Link>
      <Box component="span">.</Box>
    </Alert>
  );
}
