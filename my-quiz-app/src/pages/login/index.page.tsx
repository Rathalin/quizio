import GradientWord from '@/components/GradientWord';
import {
  Box,
  Button,
  Card,
  CardActions,
  CardContent,
  TextField,
  Typography,
} from '@mui/material';
import { FormEvent, useState } from 'react';

export default function LoginPage() {
  function onSubmit(event: FormEvent<HTMLFormElement>) {}

  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');

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
          </CardContent>
        </Card>
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'end',
          }}
        >
          <Button variant="contained" color="primary">
            Login
          </Button>
        </Box>
      </form>
    </Box>
  );
}
