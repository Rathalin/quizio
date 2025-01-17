import GradientWord from '@/components/GradientWord';
import OverviewForm from '@/page-components/quiz/create/OverviewForm';
import SummaryForm from '@/page-components/quiz/create/SummaryForm';
import {
  Box,
  Card,
  CardContent,
  Grid,
  Step,
  StepLabel,
  Stepper,
  Typography,
} from '@mui/material';
import { useEffect, useState } from 'react';

import { useQueryClient } from '@tanstack/react-query';
import {
  QuizOverviewForm,
  QuizQuestionsForm,
} from '@/page-components/quiz/quiz-form-schema';
import QuestionsForm from '@/page-components/quiz/create/QuestionsForm';
import {
  defaultOverviewFormData,
  defaultQuestionsFormData,
} from '@/page-components/quiz/quiz-form-data';
import { useRouter } from 'next/router';
import { storageKeys } from '@/persistence/storage-keys';
import { useCreateQuizMutation } from '@/data/useCreateQuizMutation';

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

export default function QuizCreatePage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [activeStep, setActiveStep] = useState(0);
  const [overviewFormData, setOverviewFormData] = useState<QuizOverviewForm>(
    defaultOverviewFormData
  );
  const [questionsFormData, setQuestionsFormData] = useState<QuizQuestionsForm>(
    defaultQuestionsFormData
  );

  const {
    mutate: createQuiz,
    isLoading,
    isSuccess,
    error,
  } = useCreateQuizMutation();

  async function handleFinishQuizClick() {
    createQuiz({
      title: overviewFormData.title,
      description: overviewFormData.description,
      isPublished: true,
      questions: questionsFormData.questions.map((q) => ({
        title: q.title,
        explanation: q.explanation,
        answers: q.answers.map((a) => ({
          title: a.title,
          isCorrect: a.isCorrect,
        })),
      })),
    });
  }

  useEffect(() => {
    if (isSuccess) {
      queryClient.invalidateQueries(['allPublishedQuizzes']);
      router.push('/');
      resetQuizLocalStorage();
      setOverviewFormData(defaultOverviewFormData);
      setQuestionsFormData(defaultQuestionsFormData);
    }

    if (error != null) {
      console.error('Failed to create quiz', error);
    }
  }, [error, isSuccess, queryClient, router]);

  function handleNext() {
    setActiveStep((prevActiveStep) =>
      Math.min(prevActiveStep + 1, steps.length - 1)
    );
  }

  function handleBack() {
    setActiveStep((prevActiveStep) => Math.max(prevActiveStep - 1, 0));
  }

  function resetQuizLocalStorage() {
    localStorage.removeItem(storageKeys.quizOverviewDraft);
    localStorage.removeItem(storageKeys.quizQuestionsDraft);
  }

  const backLabel = steps.at(activeStep)?.backLabel ?? null;
  const nextLabel = steps.at(activeStep)?.nextLabel ?? null;

  return (
    <Box>
      <Typography variant="h1">
        <span>Create your </span>
        <GradientWord>quiz</GradientWord>
        <span>.</span>
      </Typography>
      <Grid container spacing={4}>
        <Grid item xs={12} md={3} sx={{ display: { xs: 'none', md: 'block' } }}>
          <Card>
            <CardContent>
              <Stepper orientation="vertical" activeStep={activeStep}>
                {steps.map((step) => (
                  <Step key={step.title}>
                    <StepLabel>{step.title}</StepLabel>
                  </Step>
                ))}
              </Stepper>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={9}>
          {steps[activeStep].title === 'Overview' && (
            <OverviewForm
              defaultData={overviewFormData}
              onSubmit={(data) => {
                setOverviewFormData(data);
                handleNext();
              }}
              backLabel={backLabel}
              nextLabel={nextLabel}
              editMode={false}
            />
          )}
          {steps[activeStep].title === 'Questions' && (
            <QuestionsForm
              defaultData={questionsFormData}
              onSubmit={(data) => {
                setQuestionsFormData(data);
                handleNext();
              }}
              onBack={(data) => {
                setQuestionsFormData(data);
                handleBack();
              }}
              backLabel={backLabel}
              nextLabel={nextLabel}
              editMode={false}
            />
          )}
          {steps[activeStep].title === 'Summary' && (
            <SummaryForm
              overviewFormData={overviewFormData}
              questionsFormData={questionsFormData}
              backLabel={backLabel}
              onBack={() => handleBack()}
              onSubmit={() => handleFinishQuizClick()}
              isLoading={isLoading}
              isDisabled={isLoading || isSuccess}
              editMode={false}
            />
          )}
        </Grid>
      </Grid>
    </Box>
  );
}
