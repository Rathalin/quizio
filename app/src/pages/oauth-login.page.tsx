import { GetServerSideProps, InferGetServerSidePropsType } from 'next';
import { getServerSession } from 'next-auth';
import { authOptions } from './api/auth/[...nextauth].page';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import { useState } from 'react';
import LoadingCircle from '@/components/LoadingCircle';
import { useSession } from 'next-auth/react';
import { getMessages } from '@/utilities/getMessages';
import { AbstractIntlMessages } from 'next-intl';
import { z } from 'zod';
import { prefixWithBackendUrl } from '@/utilities/urlUtils';
import { isAllowedOAuthRedirectUri } from '@/utilities/oauthUtils';

export const getServerSideProps: GetServerSideProps<{
  clientId: string;
  redirectUri: string;
  state: string;
  messages: AbstractIntlMessages;
}> = async (ctx) => {
  const clientId = typeof ctx.query?.client_id === 'string' ? ctx.query.client_id : '';
  const redirectUri = typeof ctx.query?.redirect_uri === 'string' ? ctx.query.redirect_uri : '';
  const state = typeof ctx.query?.state === 'string' ? ctx.query.state : '';

  if (!clientId || !redirectUri || !isAllowedOAuthRedirectUri(redirectUri)) {
    return {
      redirect: {
        destination: '/',
        permanent: false,
      },
    };
  }

  const session = await getServerSession(ctx.req, ctx.res, authOptions);

  if (!session) {
    const oauthParams = new URLSearchParams({ client_id: clientId, redirect_uri: redirectUri, state });
    const signInParams = new URLSearchParams({ callbackUrl: `/oauth-login?${oauthParams.toString()}` });
    return {
      redirect: {
        destination: `/auth/signin?${signInParams.toString()}`,
        permanent: false,
      },
    };
  }

  const messages = await getMessages(ctx.locale, ['header', 'common']);

  return {
    props: {
      clientId,
      redirectUri,
      state,
      messages,
    },
  };
};

export default function OAuthLoginPage({
  clientId,
  redirectUri,
  state,
}: InferGetServerSidePropsType<typeof getServerSideProps>) {
  const { data: session } = useSession();
  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState('');

  const onAuthorize = async () => {
    setIsPending(true);
    setError('');
    try {
      const accessToken = session?.user.accessToken;

      const res = await fetch(prefixWithBackendUrl('/oauth/grant'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
          client_id: clientId,
          redirect_uri: redirectUri,
          state: state,
        }),
      });

      if (!res.ok) {
        throw new Error('Failed to authorize');
      }

      const rawData = await res.json();

      const oauthResponseSchema = z.object({
        code: z.string(),
        state: z.string().optional(),
      });

      const data = oauthResponseSchema.parse(rawData);

      const redirectUrl = new URL(redirectUri);
      redirectUrl.searchParams.set('code', data.code);

      if (data.state) {
        redirectUrl.searchParams.set('state', data.state);
      }

      window.location.href = redirectUrl.toString();
    } catch (err) {
      console.error(err);
      setError('An error occurred during authorization.');
      setIsPending(false);
    }
  };

  return (
    <Box sx={{ display: 'flex', justifyContent: 'center', mt: 8 }}>
      <Card sx={{ maxWidth: 400, width: '100%' }}>
        <CardContent
          sx={{ display: 'flex', flexDirection: 'column', gap: 3, alignItems: 'center', textAlign: 'center' }}
        >
          <Typography variant="h5" component="h1">
            Authorize Application
          </Typography>
          <Typography variant="body1">
            The application <strong>{clientId}</strong> is requesting access to your Quizio account.
          </Typography>
          <Typography variant="body2" color="text.secondary">
            You will be redirected to <strong>{new URL(redirectUri).host}</strong>
          </Typography>

          {error && (
            <Typography variant="body2" color="error">
              {error}
            </Typography>
          )}

          <Button
            variant="contained"
            color="primary"
            onClick={onAuthorize}
            disabled={isPending}
            startIcon={isPending ? <LoadingCircle /> : null}
            fullWidth
            size="large"
          >
            Authorize
          </Button>

          <Button
            variant="text"
            color="inherit"
            onClick={() => {
              const cancelUrl = new URL(redirectUri);
              cancelUrl.searchParams.set('error', 'access_denied');
              if (state) {
                cancelUrl.searchParams.set('state', state);
              }
              window.location.href = cancelUrl.toString();
            }}
            disabled={isPending}
            fullWidth
          >
            Cancel
          </Button>
        </CardContent>
      </Card>
    </Box>
  );
}
