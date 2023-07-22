import { Box, Typography } from '@mui/material';
import Link from 'next/link';

export default function ImprintPage() {
  return (
    <Box>
      <Typography variant="h1">{'Imprint'}</Typography>
      <Typography variant="h5" component="p">
        {'Daniel Flockert, BSc.'}
      </Typography>
      <Typography>{'1120, Vienna'}</Typography>
      <Typography>{'Austria'}</Typography>
      <Typography variant="h6" component="p" sx={{ marginTop: 2 }}>
        <Link href="mailto:daniel@flockert.at">{'daniel@flockert.at'}</Link>
      </Typography>
      <Typography variant="body2" sx={{ marginTop: 6 }}>
        {
          'This website is not operated for commercial purposes and is solely intended to spread joy.'
        }
      </Typography>
    </Box>
  );
}
