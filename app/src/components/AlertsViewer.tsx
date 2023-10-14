import { getAlertsGQL } from '@/graphql/alerts';
import { Enum_Alert_Imagesize } from '@/graphql/generated/graphql';
import { useColorMode } from '@/page-components/theme.context';
import { useDismissedAlertIds } from '@/persistence/dismissed-alert-ids';
import { getBackendImageUrl } from '@/utilities/getImageUrl';
import { seconds } from '@/utilities/time';
import { Alert, Collapse, Grid, Stack } from '@mui/material';
import { useQuery } from '@tanstack/react-query';
import request from 'graphql-request';
import Image from 'next/image';
import ReactMarkdown from 'react-markdown';

export default function AlertsViewer() {
  const { mode } = useColorMode();
  const { dismissedAlertIds, addDismissedAlertId } = useDismissedAlertIds();

  const { data } = useQuery({
    queryKey: ['alerts'],
    queryFn: () => request(process.env.NEXT_PUBLIC_GRAPHQL_URL, getAlertsGQL),
    staleTime: seconds(30),
  });

  const alerts = data?.alerts?.data ?? [];

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
        <Collapse in={!dismissedAlertIds.includes(alert.id!)} key={alert.id}>
          <Alert
            severity={alert.attributes?.severity}
            variant="standard"
            icon={false}
            sx={{
              '& .MuiAlert-message': {
                width: '100%',
              },
            }}
            onClose={() => {
              addDismissedAlertId(alert.id!);
            }}
          >
            <Grid container spacing={2}>
              <Grid
                item
                xs={12}
                sm={12}
                md={8}
                sx={{
                  '& a': {
                    textDecoration: 'underline',
                  },
                }}
              >
                <ReactMarkdown>{alert.attributes?.content ?? ''}</ReactMarkdown>
              </Grid>
              <Grid item xs={12} sm={12} md={4}>
                <Stack
                  justifyContent="center"
                  alignItems="center"
                  sx={{ height: '100%' }}
                >
                  {alert.attributes?.image?.data?.attributes?.url != null && (
                    <Image
                      src={getBackendImageUrl(
                        alert.attributes.image.data.attributes.url
                      )}
                      alt={
                        alert.attributes?.image?.data?.attributes
                          ?.alternativeText ?? 'alert image'
                      }
                      width={
                        imageSizes[alert.attributes.imageSize ?? 'Medium'].width
                      }
                      height={
                        imageSizes[alert.attributes.imageSize ?? 'Medium']
                          .height
                      }
                      style={{
                        objectFit: 'cover',
                        filter: mode === 'light' ? 'opacity(0.8)' : 'none',
                        borderRadius: 2,
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

type ImageSize = `${Enum_Alert_Imagesize}`;

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
