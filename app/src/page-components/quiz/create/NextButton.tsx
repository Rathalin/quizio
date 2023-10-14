import { Box, Button, ButtonProps } from '@mui/material';
import KeyboardArrowRightIcon from '@mui/icons-material/KeyboardArrowRight';

type NextButtonProps = ButtonProps & {};

export default function NextButton({
  variant = 'contained',
  endIcon = <KeyboardArrowRightIcon />,
  children,
  ...props
}: NextButtonProps) {
  if (children == null) {
    return <Box></Box>;
  }

  return (
    <Button variant={variant} endIcon={endIcon} type="submit" {...props}>
      {children}
    </Button>
  );
}
