import GradientWord from '@/components/GradientWord';
import { useIsMobile } from '@/custom-hooks/useIsMobile';
import OverviewForm from '@/page-components/quiz/create/OverviewForm';
import QuestionsForm from '@/page-components/quiz/create/QuestionsForm';
import SummaryForm from '@/page-components/quiz/create/SummaryForm';
import MobileQuizStepper from '@/page-components/quiz/create/MobileQuizStepper';
import {
  Box,
  Card,
  CardActions,
  CardContent,
  Grid,
  Step,
  StepLabel,
  Stepper,
  Typography,
} from '@mui/material';
import { useState } from 'react';
import { FormProvider, useForm } from 'react-hook-form';
import BackButton from '@/page-components/quiz/create/BackButton';
import NextButton from '@/page-components/quiz/create/NextButton';

const stepTitles = ['Overview', 'Questions', 'Summary'] as const;
export type StepData = {
  title: (typeof stepTitles)[number];
  backLabel?: string;
  nextLabel?: string;
};
const steps = stepTitles.map((title, index) => ({
  title,
  backLabel: stepTitles[index - 1],
  nextLabel: stepTitles[index + 1],
}));

export type QuizCreateFormFields = {
  title: string;
  description: string;
  image: FileList;
  questions: {
    title: string;
    answers: {
      title: string;
      isCorrect: boolean;
    }[];
  }[];
};

export default function QuizCreatePage() {
  const isMobile = useIsMobile();

  const [activeStep, setActiveStep] = useState(0);

  const { ...methods } = useForm<QuizCreateFormFields>({
    defaultValues: {
      title: '',
      description: '',
      image: undefined,
      questions: [
        {
          title: '',
          answers: [
            { title: '', isCorrect: false },
            { title: '', isCorrect: false },
          ],
        },
      ],
    },
  });
  const { handleSubmit } = methods;

  function handleNext() {
    setActiveStep((prevActiveStep) =>
      Math.min(prevActiveStep + 1, steps.length - 1)
    );
  }

  function handleBack() {
    setActiveStep((prevActiveStep) => Math.max(prevActiveStep - 1, 0));
  }

  function onSubmit(_data: QuizCreateFormFields) {
    handleNext();
  }

  return (
    <Box>
      <Typography variant="h1">
        <span>Create your </span>
        <GradientWord>quiz</GradientWord>
        <span>.</span>
      </Typography>
      <Grid container spacing={4} wrap="wrap-reverse">
        <Grid item xs={12} sm={3}>
          <Card>
            <CardContent>
              {!isMobile ? (
                <Stepper orientation="vertical" activeStep={activeStep}>
                  {steps.map((step) => (
                    <Step key={step.title}>
                      <StepLabel>{step.title}</StepLabel>
                    </Step>
                  ))}
                </Stepper>
              ) : (
                <MobileQuizStepper
                  activeStep={activeStep}
                  steps={steps}
                  onNext={() => {}}
                  onBack={handleBack}
                />
              )}
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={9}>
          <FormProvider {...methods}>
            <form onSubmit={handleSubmit(onSubmit)} noValidate>
              <Card>
                <CardContent>
                  {steps[activeStep].title === 'Overview' && <OverviewForm />}
                  {steps[activeStep].title === 'Questions' && <QuestionsForm />}
                  {steps[activeStep].title === 'Summary' && <SummaryForm />}
                </CardContent>
                <CardActions
                  sx={{ padding: 2, justifyContent: 'space-between' }}
                >
                  <BackButton activeStep={activeStep} onBack={handleBack}>
                    {steps.at(activeStep)?.backLabel}
                  </BackButton>
                  <NextButton activeStep={activeStep} maxSteps={steps.length}>
                    {steps.at(activeStep)?.nextLabel}
                  </NextButton>
                </CardActions>
              </Card>
            </form>
          </FormProvider>
        </Grid>
      </Grid>
    </Box>
  );
}
