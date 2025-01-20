import GradientWord from '@/components/GradientWord';
import LoadingCircle from '@/components/LoadingCircle';
import HomeButton from '@/components/buttons/HomeButton';
import { useToastStore } from '@/persistence/taost.store';
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  TextField,
  Typography,
} from '@mui/material';
import { useMutation } from '@tanstack/react-query';
import { signIn } from 'next-auth/react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { FormEvent, useState } from 'react';

export default function SigninPage() {
  const router = useRouter();
  const toastStore = useToastStore();

  const {
    mutateAsync: login,
    isError,
    isLoading,
    isSuccess,
  } = useMutation({
    mutationKey: ['signIn'],
    mutationFn: () =>
      signIn('credentials', {
        username: identifier,
        password,
      }),
  });

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    try {
      const response = await login();
      console.log(response);
      // await router.push('/');
      toastStore.addToast('Login successful.', 'success');
    } catch (error) {
      toastStore.addToast('Invalid username or password!', 'error');
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
            {isError && (
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
            startIcon={isLoading ? <LoadingCircle /> : undefined}
            disabled={isLoading || isSuccess}
          >
            Login
          </Button>
        </Box>
      </form>
      <Alert severity="info" sx={{ marginTop: 10 }}>
        <Typography>
          <span>
            {
              'Do you need an account to create quizzes? Feel free to contact me on '
            }
          </span>
          <Link href="mailto:daniel@flockert.at">daniel@flockert.at</Link>
          <span>{'.'}</span>
        </Typography>
      </Alert>
    </Box>
  );
}
