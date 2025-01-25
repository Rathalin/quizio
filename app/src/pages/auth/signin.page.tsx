import GradientWord from '@/components/GradientWord';
import LoadingCircle from '@/components/LoadingCircle';
import HomeButton from '@/components/buttons/HomeButton';
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
import { signIn } from 'next-auth/react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { FormEvent, useState } from 'react';

export const getServerSideProps: GetServerSideProps<{
  callbackUrl: string | null;
}> = async (ctx) => {
  const callbackUrl = typeof ctx.query?.callbackUrl === 'string' ? ctx.query.callbackUrl : null;

  return {
    props: {
      callbackUrl,
    },
  };
};

export default function SigninPage({ callbackUrl }: InferGetServerSidePropsType<typeof getServerSideProps>) {
  const router = useRouter();
  const toastStore = useToastStore();

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
        toastStore.addToast('Login successful.', 'success');
        router.push(callbackUrl ?? '/');
      } else {
        setErrorStatus(res?.status ?? null);
      }
    } catch (error) {
      toastStore.addToast('An error ooccured!', 'error');
    }
  }

  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');

  return (
    <Box
      sx={{
        marginInline: 'auto',
        maxWidth: '60ch',
      }}
    >
      <Typography
        variant="h1"
        sx={{
          textAlign: 'center',
        }}
      >
        <span>Enter your </span>
        <GradientWord>credentials</GradientWord>
        <span>.</span>
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
                label="Email or username"
                type="text"
                fullWidth
                required
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
              />
              <TextField
                id="password"
                label="Password"
                type="password"
                fullWidth
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </Box>
            {errorStatus === 401 && (
              <Typography sx={{ marginTop: 2 }} variant="body2" color="error">
                {`Invalid username or password!`}
              </Typography>
            )}
          </CardContent>
        </Card>
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
          }}
        >
          <HomeButton />
          <Button
            variant="contained"
            color="primary"
            type="submit"
            startIcon={isPending ? <LoadingCircle /> : undefined}
            disabled={isPending || (isSuccess && errorStatus == null)}
          >
            Login
          </Button>
        </Box>
      </form>
      <Alert severity="info" sx={{ marginTop: 10 }}>
        <Typography>
          <span>{'Do you need an account to create quizzes? Feel free to contact me on '}</span>
          <Link href="mailto:daniel@flockert.at">daniel@flockert.at</Link>
          <span>{'.'}</span>
        </Typography>
      </Alert>
    </Box>
  );
}
