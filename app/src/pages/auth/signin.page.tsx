import GradientText from '@/components/GradientText';
import LoadingCircle from '@/components/LoadingCircle';
import { QuizioBreadcrumbs } from '@/components/breadcrumbs/QuizioBreadcrumbs';
import { useToastStore } from '@/persistence/taost.store';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import { useMutation } from '@tanstack/react-query';
import { GetServerSideProps, InferGetServerSidePropsType } from 'next';
import { getServerSession } from 'next-auth';
import { signIn } from 'next-auth/react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { FormEvent, useEffect, useState } from 'react';
import { startAuthentication } from '@simplewebauthn/browser';
import { apiClient } from '@/api-client';
import { authOptions } from '../api/auth/[...nextauth].page';
import { getMessages } from '@/utilities/getMessages';
import { useTranslations } from 'next-intl';
import PasswordIcon from '@mui/icons-material/Password';
import FingerprintIcon from '@mui/icons-material/Fingerprint';
import Head from 'next/head';
import { quizioTitle } from '@/utilities/quizioTitle';
import { PasskeyRegistrationForm } from '@/components/users/PasskeyRegistrationForm';
import EditIcon from '@mui/icons-material/Edit';
import IconButton from '@mui/material/IconButton';
import InputAdornment from '@mui/material/InputAdornment';
import Stack from '@mui/material/Stack';
import useMediaQuery from '@mui/material/useMediaQuery';
import CardActions from '@mui/material/CardActions';

export const getServerSideProps: GetServerSideProps<{
  callbackUrl: string | null;
}> = async (ctx) => {
  const callbackUrl = typeof ctx.query?.callbackUrl === 'string' ? ctx.query.callbackUrl : null;

  const session = await getServerSession(ctx.req, ctx.res, authOptions);
  if (session != null) {
    return {
      redirect: {
        destination: callbackUrl ?? '/',
        permanent: false,
      },
    };
  }

  const messages = await getMessages(ctx.locale, ['signIn', 'users']);

  return {
    props: {
      callbackUrl,
      messages,
    },
  };
};

export default function SigninPage({ callbackUrl }: InferGetServerSidePropsType<typeof getServerSideProps>) {
  const t = useTranslations();
  const router = useRouter();
  const isScreenAsSmallAsInputs = useMediaQuery(`(max-width: 442px)`);
  const { showSuccessToast, showErrorToast } = useToastStore();

  const {
    mutateAsync: login,
    isPending,
    isSuccess,
  } = useMutation({
    mutationKey: ['signIn'],
    mutationFn: () =>
      signIn('credentials', {
        username: identifier,
        password,
        redirect: false,
      }),
  });

  const {
    mutateAsync: loginPasskey,
    isPending: isPasskeyPending,
    isSuccess: isPasskeySuccess,
  } = useMutation({
    mutationKey: ['signInPasskey'],
    mutationFn: async () => {
      // 1. Get challenge from backend
      const { data: challengeData, error: challengeError } = await apiClient.POST('/auth/passkeys/login/start', {
        body: { username: identifier },
      });

      if (challengeError) {
        if (typeof (challengeError as any)?.error === 'string' && (challengeError as any).error.includes('no passkeys found for user')) {
          throw new Error('NO_PASSKEYS');
        }
        throw new Error(t('signIn.form.passkeyStatus.errorChallenge'));
      }
      if (!challengeData?.publicKey) {
        throw new Error(t('signIn.form.passkeyStatus.errorChallenge'));
      }

      // 2. Authenticate with the browser
      const asseResp = await startAuthentication(challengeData.publicKey as any);

      // 3. Send response to NextAuth provider
      return signIn('passkey', {
        passkeyResponse: JSON.stringify(asseResp),
        redirect: false,
      });
    },
  });

  const [errorStatus, setErrorStatus] = useState<number | null>(null);

  async function onPasskeyLogin() {
    if (!identifier) {
      showErrorToast(t('signIn.form.passkeyStatus.errorStart'));
      return;
    }

    try {
      const res = await loginPasskey();
      if (res?.ok === true) {
        showSuccessToast(t('signIn.form.passkeyStatus.success'));
        router.push(callbackUrl ?? '/');
      } else {
        setErrorStatus(res?.status ?? null);
      }
    } catch (error: any) {
      console.error(error);
      if (error.message === 'NO_PASSKEYS') {
        setNeedsPasskeyRegistration(true);
        router.push(
          {
            pathname: router.pathname,
            query: { ...router.query, nopasskey: 'true' },
          },
          undefined,
          { shallow: true }
        );
      } else if (error.name === 'NotAllowedError') {
        showErrorToast(t('signIn.form.passkeyStatus.errorCancel'));
      } else {
        showErrorToast(t('signIn.form.passkeyStatus.errorGeneral'));
      }
    }
  }

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    try {
      const res = await login();
      if (res?.ok === true) {
        showSuccessToast(t('signIn.form.status.success'));
        setShowPasskeyPrompt(true);
      } else {
        setErrorStatus(res?.status ?? null);
      }
    } catch (error) {
      showErrorToast(t('signIn.form.status.error'));
    }
  }

  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPasskeyPrompt, setShowPasskeyPrompt] = useState(false);
  const [needsPasskeyRegistration, setNeedsPasskeyRegistration] = useState(false);
  const [step, setStep] = useState<1 | 2>(1);

  // Sync state with URL query parameter on mount/change
  useEffect(() => {
    if (router.isReady) {
      const usernameQuery = router.query.username;
      const noPasskeyQuery = router.query.nopasskey;

      if (typeof usernameQuery === 'string' && usernameQuery !== '') {
        setIdentifier(usernameQuery);
        setStep(2);
      } else {
        setStep(1);
      }

      if (noPasskeyQuery === 'true') {
        setNeedsPasskeyRegistration(true);
      } else {
        setNeedsPasskeyRegistration(false);
      }
    }
  }, [router.isReady, router.query.username, router.query.nopasskey]);

  function onContinue(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (identifier) {
      setStep(2);
      setErrorStatus(null);

      const newQuery: Record<string, any> = { ...router.query, username: identifier };
      delete newQuery.nopasskey; // just in case

      // Persist username to URL, keeping other query params
      router.push(
        {
          pathname: router.pathname,
          query: newQuery,
        },
        undefined,
        { shallow: true }
      );
    }
  }

  function handleEditIdentifier() {
    setStep(1);
    setErrorStatus(null);
    setNeedsPasskeyRegistration(false);
    // Remove username from URL
    const newQuery: Record<string, any> = { ...router.query };
    delete newQuery.username;
    delete newQuery.nopasskey;
    router.push(
      {
        pathname: router.pathname,
        query: newQuery,
      },
      undefined,
      { shallow: true }
    );
  }

  return (
    <>
      <Head>
        <title>{quizioTitle(t('signIn.meta.title'))}</title>
      </Head>
      <Box>
        <QuizioBreadcrumbs>
          <Link href="/auth/signin">{t('signIn.breadcrumbs.current')}</Link>
        </QuizioBreadcrumbs>
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            marginTop: {
              sx: 4,
              lg: 6,
            },
          }}
        >
          <Card sx={{ maxWidth: '40ch', width: '100%' }}>
            <CardContent sx={{ padding: { xs: 2, sm: 4 } }}>
              <Typography
                component="h1"
                variant="h2"
                sx={{
                  marginBottom: 6,
                  textAlign: isScreenAsSmallAsInputs ? 'start' : 'center',
                }}
              >
                {t.rich('signIn.heading', { gradient: (chunks) => <GradientText>{chunks}</GradientText> })}
              </Typography>
              <Box
                sx={{
                  margin: 'auto',
                }}
              >
                {showPasskeyPrompt ? (
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, marginBottom: 2 }}>
                    <Typography variant="body1">
                      {t('signIn.form.passkeyPrompt.description')}
                    </Typography>
                    <PasskeyRegistrationForm onSuccess={() => router.push(callbackUrl ?? '/')} />
                    <Button
                      variant="text"
                      color="inherit"
                      onClick={() => router.push(callbackUrl ?? '/')}
                    >
                      {t('signIn.form.passkeyPrompt.skipButton')}
                    </Button>
                  </Box>
                ) : needsPasskeyRegistration ? (
                  <form onSubmit={onSubmit}>
                    <Box
                      sx={{
                        display: 'flex',
                        flexDirection: 'column',
                        gap: 2,
                        marginBottom: 2,
                      }}
                    >
                      <Typography variant="body1" sx={{ marginBottom: 1 }}>
                        {t('signIn.form.noPasskeyPrompt.description')}
                      </Typography>
                      <TextField
                        id="identifier-no-passkey"
                        label={t('signIn.form.username.label')}
                        type="text"
                        fullWidth
                        required
                        value={identifier}
                        disabled={true}
                        slotProps={{
                          input: {
                            endAdornment: (
                              <InputAdornment position="end">
                                <IconButton onClick={handleEditIdentifier} edge="end" disabled={isPending || isPasskeyPending}>
                                  <EditIcon />
                                </IconButton>
                              </InputAdornment>
                            ),
                          }
                        }}
                      />
                      <TextField
                        id="password"
                        label={t('signIn.form.password.label')}
                        type="password"
                        fullWidth
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        disabled={isPending}
                        autoFocus
                      />
                      {errorStatus === 401 && (
                        <Typography variant="body2" color="error">
                          {t('signIn.form.invalidCredentials')}
                        </Typography>
                      )}
                      <Stack gap={2} sx={{ mt: 1 }}>
                        <Button
                          variant="contained"
                          color="primary"
                          type="submit"
                          startIcon={isPending ? <LoadingCircle /> : <PasswordIcon />}
                          disabled={isPending || ((isSuccess) && errorStatus == null) || !password}
                          size="large"
                        >
                          {t('signIn.form.button.label')}
                        </Button>
                        <Button
                          variant="text"
                          color="inherit"
                          onClick={() => {
                            setNeedsPasskeyRegistration(false);
                            const newQuery: Record<string, any> = { ...router.query };
                            delete newQuery.nopasskey;
                            router.push(
                              {
                                pathname: router.pathname,
                                query: newQuery,
                              },
                              undefined,
                              { shallow: true }
                            );
                          }}
                          disabled={isPending}
                        >
                          {t('signIn.form.noPasskeyPrompt.backButton')}
                        </Button>
                      </Stack>
                    </Box>
                  </form>
                ) : (
                  <form onSubmit={step === 1 ? onContinue : onSubmit}>
                    <Box
                      sx={{
                        display: 'flex',
                        flexDirection: 'column',
                        gap: 2,
                      }}
                    >
                      <TextField
                        id="identifier"
                        label={t('signIn.form.username.label')}
                        type="text"
                        fullWidth
                        required
                        value={identifier}
                        onChange={(e) => setIdentifier(e.target.value)}
                        disabled={step === 2 || isPending || isPasskeyPending}
                        slotProps={{
                          input: step === 2
                            ? {
                              endAdornment: (
                                <InputAdornment position="end">
                                  <IconButton onClick={handleEditIdentifier} edge="end" disabled={isPending || isPasskeyPending}>
                                    <EditIcon />
                                  </IconButton>
                                </InputAdornment>
                              ),
                            }
                            : undefined,
                        }}
                        sx={{
                          marginBottom: 2,
                        }}
                      />
                      {step === 2 && (
                        <TextField
                          id="password"
                          label={t('signIn.form.password.label')}
                          type="password"
                          fullWidth
                          required
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          disabled={isPending || isPasskeyPending}
                          autoFocus
                        />
                      )}
                    </Box>
                    {errorStatus === 401 && (
                      <Typography sx={{ marginBottom: 2 }} variant="body2" color="error">
                        {t('signIn.form.invalidCredentials')}
                      </Typography>
                    )}
                    <Box
                      sx={{
                        display: 'flex',
                        flexDirection: 'column',
                        gap: 2,
                      }}
                    >
                      {step === 1 ? (
                        <Button
                          variant="contained"
                          color="primary"
                          type="submit"
                          disabled={!identifier}
                          size="large"
                          sx={{ minWidth: '16ch', marginBottom: 1 }}
                        >
                          {t('signIn.form.button.continue')}
                        </Button>
                      ) : (
                        <Stack gap={2}>
                          <Button
                            variant="contained"
                            color="primary"
                            type="submit"
                            startIcon={isPending ? <LoadingCircle /> : <PasswordIcon />}
                            disabled={isPending || isPasskeyPending || ((isSuccess || isPasskeySuccess) && errorStatus == null) || !password}
                            size="large"
                            sx={{ minWidth: '16ch', marginTop: 2 }}
                          >
                            {t('signIn.form.button.label')}
                          </Button>
                          <Typography variant="body2" sx={{ textAlign: 'center' }}>
                            {t('signIn.or')}
                          </Typography>
                          <Button
                            variant="outlined"
                            onClick={onPasskeyLogin}
                            startIcon={isPasskeyPending ? <LoadingCircle /> : <FingerprintIcon />}
                            disabled={isPending || isPasskeyPending || ((isSuccess || isPasskeySuccess) && errorStatus == null) || !identifier}
                            size="large"
                            sx={{ minWidth: '16ch' }}
                          >
                            {t('signIn.form.passkeyButton.label')}
                          </Button>
                        </Stack>
                      )}
                    </Box>
                  </form>
                )}
              </Box>
            </CardContent>
            <CardActions sx={{ padding: 0 }} />
          </Card>
          <Alert severity="info" sx={{ marginTop: 10, marginInline: 'auto', maxWidth: '60ch' }}>
            <Typography>
              <span>
                {t.rich('signIn.helpAlert', {
                  email: () => <Link href={`mailto:${t('common.email')}`}>{t('common.email')}</Link>,
                })}
              </span>
            </Typography>
          </Alert>
        </Box>
      </Box>
    </>
  );
}
