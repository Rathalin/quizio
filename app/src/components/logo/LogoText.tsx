import Typography from '@mui/material/Typography';
import GradientWord from '../GradientWord';

export default function LogoText() {
  return (
    <Typography
      variant="h1"
      sx={{
        marginBlock: 0,
        fontWeight: '700',
        transition: 'transform 0.1s linear',
        '&:hover': {
          transform: 'scale(1.02)',
        },
      }}
    >
      <GradientWord>Quizio</GradientWord>
    </Typography>
  );
}
