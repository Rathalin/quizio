import { KeyboardArrowLeft, KeyboardArrowRight } from '@mui/icons-material';
import { Button, MobileStepper, useTheme } from '@mui/material';

type MobileQuizStepperProps = {
  activeStep: number;
  onNext: () => void;
  onBack: () => void;
  steps: readonly string[];
};

export default function MobileQuizStepper({
  steps,
  activeStep,
  onNext,
  onBack,
}: MobileQuizStepperProps) {
  const theme = useTheme();

  const maxSteps = steps.length;

  return (
    <MobileStepper
      variant="dots"
      position="static"
      steps={maxSteps}
      activeStep={activeStep}
      nextButton={
        <Button
          size="small"
          onClick={() => onNext()}
          disabled={activeStep === maxSteps - 1}
        >
          Next
          {theme.direction === 'rtl' ? (
            <KeyboardArrowLeft />
          ) : (
            <KeyboardArrowRight />
          )}
        </Button>
      }
      backButton={
        <Button
          size="small"
          onClick={() => onBack()}
          disabled={activeStep === 0}
        >
          {theme.direction === 'rtl' ? (
            <KeyboardArrowRight />
          ) : (
            <KeyboardArrowLeft />
          )}
          Back
        </Button>
      }
    />
  );
}
