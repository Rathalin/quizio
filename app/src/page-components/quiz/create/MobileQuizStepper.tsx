import { MobileStepper, useTheme } from '@mui/material';
import { StepData } from '@/pages/quiz/create/index.page';
import BackButton from './BackButton';
import NextButton from './NextButton';

type MobileQuizStepperProps = {
  activeStep: number;
  onNext: () => void;
  onBack: () => void;
  steps: StepData[];
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
        <NextButton activeStep={activeStep} onNext={onNext} maxSteps={maxSteps}>
          {steps.at(activeStep)?.nextLabel}
        </NextButton>
      }
      backButton={
        <BackButton activeStep={activeStep} onBack={onBack}>
          {steps.at(activeStep)?.backLabel}
        </BackButton>
      }
    />
  );
}
