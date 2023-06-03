import { KeyboardArrowLeft as KeyboardArrowLeftIcon } from '@mui/icons-material';
import { Box, Button, ButtonProps } from '@mui/material';

type BackButtonProps = ButtonProps & {
  activeStep: number;
  onBack: () => void;
};

export default function BackButton({
  activeStep,
  onBack,
  variant = 'outlined',
  startIcon = <KeyboardArrowLeftIcon />,
  children,
  ...props
}: BackButtonProps) {
  if (children == null) {
    return <Box></Box>;
  }

  return (
    <Button
      variant={variant}
      startIcon={startIcon}
      disabled={activeStep === 0}
      onClick={() => onBack()}
      {...props}
    >
      {children}
    </Button>
  );
}
