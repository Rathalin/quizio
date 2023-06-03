import { useRouter } from 'next/router';
import Logo from '../Logo';
import { Box } from '@mui/material';

export default function LogoButton() {
  const router = useRouter();
  return (
    <Box
      sx={{ cursor: 'pointer', display: ' inline' }}
      onClick={() => router.push('/')}
    >
      <Logo />
    </Box>
  );
}
