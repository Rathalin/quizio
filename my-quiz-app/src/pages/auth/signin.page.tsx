import GradientWord from '@/components/GradientWord';
import LinkButton from '@/components/LinkButton';
import { Box, Card, CardContent, TextField, Typography } from '@mui/material';
import { signIn } from 'next-auth/react';
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
            justifyContent: 'end',
          }}
        >
          <LinkButton
            hrefObserver="/"
            variant="contained"
            color="primary"
            type="submit"
          >
            Login
          </LinkButton>
        </Box>
      </form>
    </Box>
  );
}
