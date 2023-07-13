import { KeyboardArrowRight as KeyboardArrowRightIcon } from '@mui/icons-material';
import { Box, Button, ButtonProps } from '@mui/material';

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
