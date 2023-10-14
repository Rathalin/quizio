import { Box, Button, ButtonProps } from '@mui/material';
import KeyboardArrowLeftIcon from '@mui/icons-material/KeyboardArrowLeft';

type BackButtonProps = ButtonProps & {};

export default function BackButton({
  variant = 'outlined',
  startIcon = <KeyboardArrowLeftIcon />,
  children,
  ...other
}: BackButtonProps) {
  if (children == null) {
    return <Box></Box>;
  }

  return (
    <Button variant={variant} startIcon={startIcon} {...other}>
      {children}
    </Button>
  );
}
