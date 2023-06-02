import GradientWord from '@/components/GradientWord';
import { useIsMobile } from '@/custom-hooks/useIsMobile';
import MobileQuizStepper from '@/page-components/quiz/create/MobileQuizStepper';
import { KeyboardArrowLeft, KeyboardArrowRight } from '@mui/icons-material';
import {
  Box,
  Button,
  Card,
  CardContent,
  Grid,
  MobileStepper,
  Step,
  StepLabel,
  Stepper,
  Typography,
} from '@mui/material';
import { useEffect } from 'react';

export default function QuizCreatePage() {
  const isMobile = useIsMobile();

  const steps = ['General', 'Questions', 'Summary'];

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
                <MobileQuizStepper steps={steps} />
              )}
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={9}>
          <Card>
            <CardContent>Hello</CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}
