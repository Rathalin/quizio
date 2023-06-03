import { KeyboardArrowRight as KeyboardArrowRightIcon } from '@mui/icons-material';
import { Box, Button, ButtonProps } from '@mui/material';

type NextButtonProps = ButtonProps & {
  activeStep: number;
  maxSteps: number;
};

export default function NextButton({
  activeStep,
  maxSteps,
  variant = 'contained',
  endIcon = <KeyboardArrowRightIcon />,
  children,
  ...props
}: NextButtonProps) {
  if (children == null) {
    return <Box></Box>;
  }

  return (
    <Button
      variant={variant}
      endIcon={endIcon}
      disabled={activeStep === maxSteps}
      type="submit"
      {...props}
    >
      {children != null ? children : 'Next'}
    </Button>
  );
}
