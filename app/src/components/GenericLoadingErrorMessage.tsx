import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { useTranslations } from 'next-intl';

import Link from 'next/link';

export default function GenericLoadingErrorMessage() {
  const t = useTranslations('common');

  return (
    <Alert severity="error" variant="standard" sx={{ marginTop: 2 }}>
      <Typography variant="body1" component="div" sx={{ marginBottom: 0 }}>
        <Box component="span">
          {t.rich('error.generic.content', {
            email: () => (
              <Link href="mailto:daniel@flockert.at" style={{ fontWeight: 700 }} className="no-underline">
                {t('email')}
              </Link>
            ),
          })}
        </Box>

        <Box component="span">.</Box>
      </Typography>
    </Alert>
  );
}
