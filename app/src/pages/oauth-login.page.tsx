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
import { AbstractIntlMessages, useTranslations } from 'next-intl';
import { z } from 'zod';
import Head from 'next/head';
import { prefixWithBackendUrl } from '@/utilities/urlUtils';
import { quizioTitle } from '@/utilities/quizioTitle';

export const getServerSideProps: GetServerSideProps<{
  clientId: string;
  clientName: string;
  redirectUri: string;
  state: string;
  codeChallenge: string;
  codeChallengeMethod: string;
  messages: AbstractIntlMessages;
}> = async (ctx) => {
  const clientId = typeof ctx.query?.client_id === 'string' ? ctx.query.client_id : '';
  const clientName = typeof ctx.query?.client_name === 'string' ? ctx.query.client_name : '';
  const redirectUri = typeof ctx.query?.redirect_uri === 'string' ? ctx.query.redirect_uri : '';
  const state = typeof ctx.query?.state === 'string' ? ctx.query.state : '';
  const codeChallenge = typeof ctx.query?.code_challenge === 'string' ? ctx.query.code_challenge : '';
  const codeChallengeMethod = typeof ctx.query?.code_challenge_method === 'string' ? ctx.query.code_challenge_method : '';
  const responseType = typeof ctx.query?.response_type === 'string' ? ctx.query.response_type : '';
  const resource = typeof ctx.query?.resource === 'string' ? ctx.query.resource : '';

  if (!clientId || !redirectUri) {
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
    if (clientName) oauthParams.set('client_name', clientName);
    if (codeChallenge) oauthParams.set('code_challenge', codeChallenge);
    if (codeChallengeMethod) oauthParams.set('code_challenge_method', codeChallengeMethod);
    if (responseType) oauthParams.set('response_type', responseType);
    if (resource) oauthParams.set('resource', resource);
    const signInParams = new URLSearchParams({ callbackUrl: `/oauth-login?${oauthParams.toString()}` });
    return {
      redirect: {
        destination: `/auth/signin?${signInParams.toString()}`,
        permanent: false,
      },
    };
  }

  const messages = await getMessages(ctx.locale, ['oauthLogin']);

  return {
    props: {
      clientId,
      clientName,
      redirectUri,
      state,
      codeChallenge,
      codeChallengeMethod,
      messages,
    },
  };
};

export default function OAuthLoginPage({
  clientId,
  clientName,
  redirectUri,
  state,
  codeChallenge,
  codeChallengeMethod,
}: InferGetServerSidePropsType<typeof getServerSideProps>) {
  const t = useTranslations('oauthLogin');
  const { data: session } = useSession();
  const [isPending, setIsPending] = useState(false);
  const [hasError, setHasError] = useState(false);

  const onAuthorize = async () => {
    setIsPending(true);
    setHasError(false);
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
          code_challenge: codeChallenge,
          code_challenge_method: codeChallengeMethod,
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
      setHasError(true);
      setIsPending(false);
    }
  };

  const displayClientName = clientName || (clientId.length > 40 ? clientId.substring(0, 10) + '...' + clientId.substring(clientId.length - 10) : clientId);

  return (
    <>
      <Head>
        <title>{quizioTitle(t('meta.title'))}</title>
      </Head>
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 8 }}>
        <Card sx={{ maxWidth: 400, width: '100%' }}>
          <CardContent
            sx={{ display: 'flex', flexDirection: 'column', gap: 3, alignItems: 'center', textAlign: 'center' }}
          >
            <Typography variant="h5" component="h1">
              {t('heading')}
            </Typography>
            <Typography variant="body1">
              {t.rich('description', {
                clientId: displayClientName,
                strong: (chunks) => <strong>{chunks}</strong>,
              })}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {t.rich('redirectNotice', {
                host: new URL(redirectUri).host,
                strong: (chunks) => <strong>{chunks}</strong>,
              })}
            </Typography>

            {hasError && (
              <Typography variant="body2" color="error">
                {t('status.error')}
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
              {t('actions.authorize')}
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
              {t('actions.cancel')}
            </Button>
          </CardContent>
        </Card>
      </Box>
    </>
  );
}
