import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';

import Link from 'next/link';

export default function GenericLoadingErrorMessage() {
  return (
    <Alert severity="error" variant="filled" sx={{ marginTop: 2 }}>
      <Typography variant="body1" component="div" sx={{ marginBottom: 0 }}>
        <Box component="span">
          {'Sorry, the Quizio services are currently unavailable. If the error persists, contact '}
        </Box>
        <Link href="mailto:daniel@flockert.at" style={{ fontWeight: 700 }} className="no-underline">
          daniel@flockert.at
        </Link>
        <Box component="span">.</Box>
      </Typography>
    </Alert>
  );
}
