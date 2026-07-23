import { useRouter } from 'next/router';
import Stack from '@mui/material/Stack';

import LogoText from '../logo/LogoText';

export default function LogoButton() {
  const router = useRouter();
  return (
    <Stack sx={{ alignItems: 'center', cursor: 'pointer', display: 'inline-flex' }} onClick={() => router.push('/')}>
      <LogoText />
    </Stack>
  );
}
