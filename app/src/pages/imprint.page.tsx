import { QuizioBreadcrumbs } from '@/components/breadcrumbs/QuizioBreadcrumbs';
import GradientText from '@/components/GradientText';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Link from 'next/link';

export default function ImprintPage() {
  return (
    <Box>
      <QuizioBreadcrumbs>
        <Link href="/imprint">{'Imprint'}</Link>
      </QuizioBreadcrumbs>
      <Typography variant="h1">
        <GradientText>{'Imprint'}</GradientText>
      </Typography>
      <Typography variant="h5" component="p">
        {'Daniel Flockert, MSc.'}
      </Typography>
      <Typography>{'1120, Vienna'}</Typography>
      <Typography>{'Austria'}</Typography>
      <Typography variant="h6" component="p" sx={{ marginTop: 2 }}>
        <Link href="mailto:daniel@flockert.at">{'daniel@flockert.at'}</Link>
      </Typography>
      <Typography variant="body2" sx={{ marginTop: 6 }}>
        {'This website is not operated for commercial purposes and is solely intended to spread joy.'}
      </Typography>
    </Box>
  );
}
