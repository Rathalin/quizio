import { useAlertsQuery } from '@/data/useAlertsQuery';
import { useDismissedAlertIds } from '@/persistence/dismissed-alert-ids.store';
import { prefixWithBackendUrl } from '@/utilities/urlUtils';
import Alert from '@mui/material/Alert';
import Collapse from '@mui/material/Collapse';
import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import NextLink from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/router';
import ReactMarkdown from 'react-markdown';

export default function AlertsViewer() {
  const { locale } = useRouter();
  const { dismissedAlertIds, addDismissedAlertId } = useDismissedAlertIds();

  const { data } = useAlertsQuery();

  const alerts = data?.alerts ?? [];

  return (
    <Stack
      gap={1}
      sx={{
        marginBottom: alerts.length === dismissedAlertIds.length ? 0 : 4,
        transitionProperty: 'margin-bottom',
        transitionDuration: '100ms',
      }}
    >
      {alerts.map((alert) => (
        <Collapse key={alert.uuid} in={!dismissedAlertIds.includes(alert.uuid)}>
          <Alert
            severity={alert.severity}
            variant="standard"
            icon={false}
            sx={{
              '& .MuiAlert-message': {
                width: '100%',
              },
            }}
            onClose={() => {
              addDismissedAlertId(alert.uuid);
            }}
          >
            <Grid container spacing={2}>
              <Grid
                size={{ xs: 12, sm: 12, md: 8 }}
                sx={{
                  '& a': {
                    textDecoration: 'underline',
                  },
                }}
              >
                <ReactMarkdown
                  components={{
                    a: ({ href, ...other }) => <NextLink href={'/'} {...other} />,
                  }}
                >
                  {locale === 'de' ? alert.markdownDe : alert.markdownEn}
                </ReactMarkdown>
              </Grid>
              <Grid size={{ xs: 12, sm: 12, md: 4 }}>
                <Stack justifyContent="center" alignItems="center" sx={{ height: '100%' }}>
                  {alert.imageUrl != null && (
                    <Image
                      src={prefixWithBackendUrl(alert.imageUrl)}
                      alt="alert image"
                      width={imageSizes[alert.imageSize ?? 'medium'].width}
                      height={imageSizes[alert.imageSize ?? 'medium'].height}
                      style={{
                        objectFit: 'cover',
                        borderRadius: 4,
                      }}
                      unoptimized
                    />
                  )}
                </Stack>
              </Grid>
            </Grid>
          </Alert>
        </Collapse>
      ))}
    </Stack>
  );
}

type ImageSize = 'small' | 'medium' | 'large';

const imageAspectRatio = 16 / 9;
const imageSizes = {
  small: {
    width: 60 * imageAspectRatio,
    height: 60,
  },
  medium: {
    width: 90 * imageAspectRatio,
    height: 90,
  },
  large: {
    width: 120 * imageAspectRatio,
    height: 120,
  },
} as const satisfies Record<ImageSize, { width: number; height: number }>;
