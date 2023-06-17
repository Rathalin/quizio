import { useRouter } from 'next/router';
import { Stack } from '@mui/material';
import LogoText from '../logo/LogoText';

export default function LogoButton() {
  const router = useRouter();
  return (
    <Stack
      alignItems="center"
      sx={{ cursor: 'pointer', display: 'inline-flex' }}
      onClick={() => router.push('/')}
    >
      <LogoText />
    </Stack>
  );
}
