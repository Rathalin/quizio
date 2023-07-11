import { getAlertsGQL } from '@/graphql/alerts';
import { Enum_Alert_Imagesize } from '@/graphql/generated/graphql';
import { Alert, Box, Collapse, Grid, Stack } from '@mui/material';
import { useQuery } from '@tanstack/react-query';
import request from 'graphql-request';
import Image from 'next/image';
import { useState } from 'react';
import ReactMarkdown from 'react-markdown';

export default function AlertsViewer() {
  const { data } = useQuery({
    queryKey: ['alerts'],
    queryFn: () => request(process.env.NEXT_PUBLIC_GRAPHQL_URL, getAlertsGQL),
  });

  const [closedAlertIds, setClosedAlertIds] = useState<string[]>([]);

  return (
    <Box sx={{ marginBottom: 2 }}>
      {data?.alerts?.data.map((alert) => (
        <Collapse in={!closedAlertIds.includes(alert.id!)} key={alert.id}>
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
              setClosedAlertIds((prev) => prev.concat(alert.id!));
            }}
          >
            <Grid container spacing={2}>
              <Grid
                item
                xs={12}
                sm={8}
                md={9}
                lg={10}
                sx={{
                  '& a': {
                    textDecoration: 'underline',
                  },
                }}
              >
                <ReactMarkdown>{alert.attributes?.content ?? ''}</ReactMarkdown>
              </Grid>
              <Grid item xs={12} sm={4} md={3} lg={2}>
                <Stack justifyContent="center" sx={{ height: '100%' }}>
                  {alert.attributes?.image?.data?.attributes?.url != null && (
                    <Image
                      src={`${process.env.NEXT_PUBLIC_BACKEND_URL}${alert.attributes.image.data.attributes.url}`}
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
                      }}
                      priority
                      unoptimized
                    />
                  )}
                </Stack>
              </Grid>
            </Grid>
          </Alert>
        </Collapse>
      ))}
    </Box>
  );
}

type ImageSize = `${Enum_Alert_Imagesize}`;

const imageSizes = {
  small: {
    width: 60,
    height: 60,
  },
  medium: {
    width: 90,
    height: 90,
  },
  large: {
    width: 120,
    height: 120,
  },
} as const satisfies Record<ImageSize, { width: number; height: number }>;
