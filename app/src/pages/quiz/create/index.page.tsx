import GradientWord from '@/components/GradientWord';
import OverviewForm from '@/page-components/quiz/create/OverviewForm';
import QuestionsForm from '@/page-components/quiz/create/QuestionsForm';
import SummaryForm from '@/page-components/quiz/create/SummaryForm';
import {
  Box,
  Button,
  Card,
  CardActions,
  CardContent,
  Grid,
  Step,
  StepLabel,
  Stepper,
  Typography,
} from '@mui/material';
import { useEffect, useState } from 'react';
import { FormProvider, useForm } from 'react-hook-form';
import BackButton from '@/page-components/quiz/create/BackButton';
import NextButton from '@/page-components/quiz/create/NextButton';
import {
  createQuizGQL,
  createQuestionGQL,
  createAnswerGQL,
} from '@/graphql/createQuiz';
import {
  QuizInput,
  QuestionInput,
  AnswerInput,
} from '@/graphql/generated/graphql';
import { useMutation } from '@tanstack/react-query';
import request from 'graphql-request';
import router from 'next/router';
import { useSession } from 'next-auth/react';
import LoadingCircle from '@/components/LoadingCircle';
import { Publish as PublishIcon } from '@mui/icons-material';
import { uploadImageGQL } from '@/graphql/upload';

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
  image: string;
  questions: {
    title: string;
    answers: {
      title: string;
      isCorrect: boolean;
    }[];
  }[];
};

export const emptyQuizFormData = {
  title: '',
  description: '',
  image: '',
  questions: [
    {
      title: '',
      answers: [
        { title: '', isCorrect: false },
        { title: '', isCorrect: false },
      ],
    },
  ],
} satisfies QuizCreateFormFields;

export default function QuizCreatePage() {
  const { data: session, status } = useSession();

  const [activeStep, setActiveStep] = useState(0);

  const { ...methods } = useForm<QuizCreateFormFields>({
    defaultValues: emptyQuizFormData,
  });
  const { getValues, reset, handleSubmit } = methods;
  const { title, description, image, questions } =
    getValues() as QuizCreateFormFields;

  const createQuizMutation = useMutation({
    mutationKey: ['createQuiz'],
    mutationFn: (data: QuizInput) =>
      request(
        process.env.NEXT_PUBLIC_GRAPHQL_URL,
        createQuizGQL,
        {
          data,
        },
        {
          Authorization: `Bearer ${session?.user.acessToken}`,
        }
      ),
    onSuccess: async (data) => {
      try {
        // Create questions
        await Promise.all(
          questions.map(async (question) => {
            const questionData = await createQuestionMutation.mutateAsync({
              title: question.title,
              quiz: data.createQuiz?.data?.id,
            });

            // Create answers
            await Promise.all(
              question.answers.map(async (answer) => {
                await createAnswerMutation.mutateAsync({
                  title: answer.title,
                  correct: answer.isCorrect,
                  question: questionData.createQuestion?.data?.id,
                });
              })
            );
          })
        );
        router.push('/');
        reset(emptyQuizFormData);
      } catch (error) {
        console.error(error);
      }
    },
  });
  const createQuestionMutation = useMutation({
    mutationKey: ['createQuestion'],
    mutationFn: (data: QuestionInput) =>
      request(
        process.env.NEXT_PUBLIC_GRAPHQL_URL,
        createQuestionGQL,
        {
          data,
        },
        {
          Authorization: `Bearer ${session?.user.acessToken}`,
        }
      ),
  });
  const createAnswerMutation = useMutation({
    mutationKey: ['createAnswer'],
    mutationFn: (data: AnswerInput) =>
      request(
        process.env.NEXT_PUBLIC_GRAPHQL_URL,
        createAnswerGQL,
        {
          data,
        },
        {
          Authorization: `Bearer ${session?.user.acessToken}`,
        }
      ),
  });
  const uploadImageMutation = useMutation({
    mutationKey: ['uploadImage'],
    mutationFn: () =>
      request(
        process.env.NEXT_PUBLIC_GRAPHQL_URL,
        uploadImageGQL,
        {
          file: image,
        },
        {
          Authorization: `Bearer ${session?.user.acessToken}`,
        }
      ),
    onSuccess: (data) =>
      createQuizMutation.mutate({
        title,
        description,
        image: data.upload.data?.id,
        published: true,
        owner: session?.user?.id?.toString() ?? '0',
      }),
  });

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/');
    }
  }, [status]);

  function handleFinishQuizClick() {
    // Create quiz
    uploadImageMutation.mutate();
  }

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
                  {steps.at(activeStep)?.title === 'Summary' && (
                    <Button
                      variant="contained"
                      color="primary"
                      onClick={handleFinishQuizClick}
                      startIcon={
                        createQuizMutation.isLoading ? <LoadingCircle /> : null
                      }
                      endIcon={<PublishIcon />}
                    >
                      Publish quiz
                    </Button>
                  )}
                </CardActions>
              </Card>
            </form>
          </FormProvider>
        </Grid>
      </Grid>
    </Box>
  );
}
