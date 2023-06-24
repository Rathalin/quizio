import GradientWord from '@/components/GradientWord';
import HomeButton from '@/components/buttons/HomeButton';
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Snackbar,
  TextField,
  Typography,
} from '@mui/material';
import { signIn } from 'next-auth/react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { FormEvent, useState } from 'react';

export default function SigninPage() {
  const router = useRouter();

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const res = await signIn('credentials', {
      identifier,
      password,
      redirect: false,
    });
    if (res?.status === 200) {
      router.push('/');
    } else if (res?.error != null) {
      setError(res.error);
    }
  }

  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);

  return (
    <Box>
      <Typography variant="h1">
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
            {error != null && (
              <Typography sx={{ marginTop: 2 }} variant="body2" color="error">
                Invalid credentials
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
          <Button variant="contained" color="primary" type="submit">
            Login
          </Button>
        </Box>
      </form>
      <Alert severity="info" sx={{ marginTop: 4 }}>
        <Typography>
          <span>
            {
              'Do you need an account to create quizzes? Feel free to contact me on '
            }
          </span>
          <Link href="mailto:daniel@flockert.at" style={{ color: 'inherit' }}>
            daniel@flockert.at
          </Link>
          <span>{'.'}</span>
        </Typography>
      </Alert>
    </Box>
  );
}
