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
import { FormEvent, useState } from 'react';
import { authOptions } from '../api/auth/[...nextauth].page';
import { getMessages } from '@/utilities/getMessages';
import { useTranslations } from 'next-intl';
import LoginOutlinedIcon from '@mui/icons-material/LoginOutlined';

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

  const messages = await getMessages(ctx.locale, ['signIn']);

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

  const [errorStatus, setErrorStatus] = useState<number | null>(null);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    try {
      const res = await login();
      if (res?.ok === true) {
        showSuccessToast(t('signIn.form.status.success'));
        router.push(callbackUrl ?? '/');
      } else {
        setErrorStatus(res?.status ?? null);
      }
    } catch (error) {
      showErrorToast(t('signIn.form.status.error'));
    }
  }

  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');

  return (
    <Box>
      <QuizioBreadcrumbs>
        <Link href="/auth/signin">{t('signIn.breadcrumbs.current')}</Link>
      </QuizioBreadcrumbs>
      <Box
        sx={{
          marginInline: 'auto',
          maxWidth: '60ch',
          marginTop: {
            sx: 4,
            lg: 6,
          },
        }}
      >
        <Typography
          variant="h1"
          sx={{
            textAlign: {
              xs: 'start',
              md: 'center',
            },
          }}
        >
          {t.rich('signIn.heading', { gradient: (chunks) => <GradientText>{chunks}</GradientText> })}
        </Typography>
        <form onSubmit={onSubmit}>
          <Card
            sx={{
              marginBottom: 2,
            }}
          >
            <CardContent>
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
                />
                <TextField
                  id="password"
                  label={t('signIn.form.password.label')}
                  type="password"
                  fullWidth
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </Box>
              {errorStatus === 401 && (
                <Typography sx={{ marginTop: 2 }} variant="body2" color="error">
                  {t('signIn.form.invalidCredentials')}
                </Typography>
              )}
            </CardContent>
          </Card>
          <Box
            sx={{
              display: 'flex',
              justifyContent: {
                xs: 'end',
                md: 'center',
              },
            }}
          >
            <Button
              variant="contained"
              color="primary"
              type="submit"
              endIcon={isPending ? <LoadingCircle /> : <LoginOutlinedIcon />}
              disabled={isPending || (isSuccess && errorStatus == null)}
              size="large"
              sx={{ minWidth: '16ch' }}
            >
              {t('signIn.form.button.label')}
            </Button>
          </Box>
        </form>
        <Alert severity="info" sx={{ marginTop: 10 }}>
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
  );
}
