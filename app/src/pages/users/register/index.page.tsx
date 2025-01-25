import GradientWord from '@/components/GradientWord';
import LinkButton from '@/components/LinkButton';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import { FormEvent, useState } from 'react';

export default function RegisterPage() {
  function onSubmit(event: FormEvent<HTMLFormElement>) {}

  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  return (
    <Box>
      <Typography variant="h1">
        <span>Create your </span>
        <GradientWord>account</GradientWord>
        <span>.</span>
      </Typography>
      <form autoComplete="off" onSubmit={onSubmit}>
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
                id="username"
                label="Username"
                type="text"
                fullWidth
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                autoComplete="new-username"
              />
              <TextField
                id="email"
                label="Email"
                type="email"
                fullWidth
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="new-email"
              />
              <TextField
                id="password"
                label="Password"
                type="password"
                fullWidth
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="new-password"
              />
            </Box>
          </CardContent>
        </Card>
        <Box
          sx={{
            display: 'flex',
          }}
        >
          <LinkButton hrefObserver="/" navigateOnClick iconSide="right">
            Back
          </LinkButton>
          <Button sx={{ marginLeft: 'auto' }} variant="contained" color="primary" type="submit">
            Register
          </Button>
        </Box>
      </form>
    </Box>
  );
}
