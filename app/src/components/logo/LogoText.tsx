import Typography from '@mui/material/Typography';
import GradientText from '../GradientText';

export default function LogoText() {
  return (
    <Typography
      variant="h1"
      sx={{
        marginBlock: 0,
        transition: 'transform 0.1s linear',
        fontWeight: 600,
        letterSpacing: '-1px',
        '&:hover': {
          transform: 'scale(1.02)',
        },
      }}
    >
      <GradientText>Quizio</GradientText>
    </Typography>
  );
}
