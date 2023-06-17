import { CircularProgress, CircularProgressProps } from '@mui/material';

type LoadingCircleProps = CircularProgressProps & {};

export default function LoadingCircle({
  size = '1rem',
  color = 'loading',
  ...other
}: LoadingCircleProps) {
  return <CircularProgress size={size} color={color} {...other} />;
}
