import CircularProgress, { type CircularProgressProps } from '@mui/material/CircularProgress';

type LoadingCircleProps = CircularProgressProps & {};

export default function LoadingCircle({ size = '1rem', color = 'loading', ...other }: LoadingCircleProps) {
  return <CircularProgress size={size} color={color} {...other} />;
}
