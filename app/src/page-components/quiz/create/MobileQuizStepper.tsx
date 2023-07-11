import { MobileStepper } from '@mui/material';
import BackButton from './BackButton';
import NextButton from './NextButton';
import { StepData } from '@/pages/quiz/create/index.page';

type MobileQuizStepperProps = {
  activeStep: number;
  onBack: () => void;
  steps: StepData[];
};

export default function MobileQuizStepper({
  steps,
  activeStep,
  onBack,
}: MobileQuizStepperProps) {
  const maxSteps = steps.length;

  return (
    <MobileStepper
      variant="dots"
      position="static"
      steps={maxSteps}
      activeStep={activeStep}
      nextButton={
        <NextButton activeStep={activeStep} maxSteps={maxSteps}>
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
