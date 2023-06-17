import { Typography } from '@mui/material';
import GradientWord from '../GradientWord';

export default function LogoText() {
  return (
    <Typography variant="h1" sx={{ marginBlock: 0, fontWeight: '700' }}>
      <GradientWord>Quizio</GradientWord>
    </Typography>
  );
}
