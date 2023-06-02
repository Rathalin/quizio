import GradientWord from '@/components/GradientWord';
import HomeButton from '@/components/buttons/HomeButton';
import { useIsMobile } from '@/custom-hooks/useIsMobile';
import MobileQuizStepper from '@/page-components/quiz/create/MobileQuizStepper';
import {
  Box,
  Card,
  CardContent,
  Grid,
  Stack,
  Step,
  StepLabel,
  Stepper,
  Typography,
} from '@mui/material';
import { useState } from 'react';

export default function QuizCreatePage() {
  const isMobile = useIsMobile();

  const steps = ['General', 'Questions', 'Summary'] as const;
  const [activeStep, setActiveStep] = useState(0);

  function handleNext() {
    setActiveStep((prevActiveStep) =>
      Math.min(prevActiveStep + 1, steps.length - 1)
    );
  }

  function handleBack() {
    setActiveStep((prevActiveStep) => Math.max(prevActiveStep - 1, 0));
  }

  return (
    <Box>
      <Typography variant="h1">
        <span>Create your </span>
        <GradientWord>quiz</GradientWord>
        <span>.</span>
      </Typography>
      <Grid container spacing={2} wrap="wrap-reverse">
        <Grid item xs={12} sm={3}>
          <Card>
            <CardContent>
              {!isMobile ? (
                <Stepper orientation="vertical">
                  {steps.map((step) => (
                    <Step key={step}>
                      <StepLabel>{step}</StepLabel>
                    </Step>
                  ))}
                </Stepper>
              ) : (
                <MobileQuizStepper
                  activeStep={activeStep}
                  steps={steps}
                  onNext={handleNext}
                  onBack={handleBack}
                />
              )}
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={9}>
          <Card>
            <CardContent>
              <Stack direction="row" justifyContent="space-between">
                <HomeButton />
              </Stack>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}
