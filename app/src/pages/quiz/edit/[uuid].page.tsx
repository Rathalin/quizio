import GradientWord from '@/components/GradientWord';
import LoadingCircle from '@/components/LoadingCircle';
import { useAuthHeader } from '@/custom-hooks/useAuthHeader';
import { useRedirectOnUnauthenticated } from '@/custom-hooks/useRedirectOnUnauthenticated';
import {
  QuizInput,
  QuestionInput,
  AnswerInput,
  Exact,
} from '@/graphql/generated/graphql';
import { getMyQuizzesByUuidGQL } from '@/graphql/myQuizzes';
import {
  updateAnswerGQL,
  updateQuestionGQL,
  updateQuizGQL,
} from '@/graphql/updateQuiz';
import BackButton from '@/page-components/quiz/create/BackButton';
import NextButton from '@/page-components/quiz/create/NextButton';
import OverviewForm from '@/page-components/quiz/create/OverviewForm';
import QuestionsForm from '@/page-components/quiz/create/QuestionsForm';
import SummaryForm from '@/page-components/quiz/create/SummaryForm';
import {
  QuizForm,
  defaultQuizFormData,
} from '@/page-components/quiz/create/quiz-form-data';
import { Save as SaveIcon } from '@mui/icons-material';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  Stepper,
  Step,
  StepLabel,
  CardActions,
  Button,
  Stack,
  Snackbar,
  Alert,
} from '@mui/material';
import { useMutation, useQuery } from '@tanstack/react-query';
import request from 'graphql-request';
import { GetServerSideProps, InferGetServerSidePropsType } from 'next';
import { useSession } from 'next-auth/react';
import { useEffect, useState } from 'react';
import { useForm, FormProvider } from 'react-hook-form';

export const getServerSideProps: GetServerSideProps<{ uuid: string }> = async (
  ctx
) => {
  const uuid = ctx.params?.uuid;
  if (typeof uuid !== 'string') {
    return {
      notFound: true,
    };
  }

  return {
    props: {
      uuid,
    },
  };
};

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

export default function QuizCreatePage({
  uuid,
}: InferGetServerSidePropsType<typeof getServerSideProps>) {
  const { data: session, status } = useSession();
  const { authHeader } = useAuthHeader(session);
  const [activeStep, setActiveStep] = useState(0);
  const [showAlert, setShowAlert] = useState(false);

  const { ...methods } = useForm<QuizForm>({
    defaultValues: defaultQuizFormData,
  });
  const { reset, handleSubmit, watch } = methods;

  const { title, description, image, questions } = watch() as QuizForm;

  useRedirectOnUnauthenticated(status);

  const quizQuery = useQuery({
    queryKey: ['quiz', uuid],
    queryFn: () =>
      request(
        process.env.NEXT_PUBLIC_GRAPHQL_URL,
        getMyQuizzesByUuidGQL,
        {
          uuid,
          ownerId: session?.user?.id?.toString() ?? '',
        },
        authHeader
      ),
    staleTime: Infinity,
  });
  const quiz = quizQuery.data?.quizzes?.data?.at(0);

  useEffect(() => {
    if (quiz != null) {
      reset({
        id: quiz?.id ?? '',
        title: quiz?.attributes?.title ?? '',
        description: quiz?.attributes?.description ?? '',
        // image: quiz?.attributes?.image?.id ?? '',
        questions: quiz?.attributes?.questions?.data.map((question) => ({
          id: question.id ?? '',
          title: question.attributes?.title ?? '',
          answers: question.attributes?.answers?.data.map((answer) => ({
            id: answer.id ?? '',
            title: answer.attributes?.title ?? '',
            isCorrect: answer.attributes?.correct ?? false,
          })),
        })),
      });
    }
  }, [quiz, reset]);

  const updateQuizMutation = useMutation({
    mutationKey: ['updateQuiz'],
    mutationFn: ({ id, data }: Exact<{ id: string; data: QuizInput }>) =>
      request(
        process.env.NEXT_PUBLIC_GRAPHQL_URL,
        updateQuizGQL,
        {
          id,
          data,
        },
        authHeader
      ),
    onSuccess: async () => {
      try {
        // Update questions
        for (const question of questions) {
          await updateQuestionMutation.mutateAsync({
            id: question.id ?? '',
            data: {
              title: question.title ?? '',
            },
          });

          // Update answers
          for (const answer of question.answers) {
            await updateAnswerMutation.mutateAsync({
              id: answer.id ?? '',
              data: {
                title: answer.title ?? '',
                correct: answer.isCorrect ?? false,
              },
            });
          }
        }
      } catch (error) {
        console.error(error);
      } finally {
        setShowAlert(true);
      }
    },
  });
  const updateQuestionMutation = useMutation({
    mutationKey: ['updateQuestion'],
    mutationFn: ({ id, data }: Exact<{ id: string; data: QuestionInput }>) =>
      request(
        process.env.NEXT_PUBLIC_GRAPHQL_URL,
        updateQuestionGQL,
        {
          id,
          data,
        },
        authHeader
      ),
  });
  const updateAnswerMutation = useMutation({
    mutationKey: ['updateAnswer'],
    mutationFn: ({ id, data }: Exact<{ id: string; data: AnswerInput }>) =>
      request(
        process.env.NEXT_PUBLIC_GRAPHQL_URL,
        updateAnswerGQL,
        {
          id,
          data,
        },
        authHeader
      ),
  });
  const isUpdateLoading =
    updateQuizMutation.isLoading ||
    updateQuestionMutation.isLoading ||
    updateAnswerMutation.isLoading;
  const isUpdateSuccess =
    updateQuizMutation.isSuccess &&
    updateQuestionMutation.isSuccess &&
    updateAnswerMutation.isSuccess;
  const isUpdateError =
    updateQuizMutation.isError ||
    updateQuestionMutation.isError ||
    updateAnswerMutation.isError;

  function handleAlertClose(_event: unknown, reason?: string) {
    if (reason === 'clickaway') {
      return;
    }
    setShowAlert(false);
  }

  function handleSaveClick() {
    // Update quiz
    updateQuizMutation.mutate({
      id: quiz?.id ?? '',
      data: {
        title,
        description,
        published: true,
        owner: session?.user?.id?.toString() ?? '0',
      },
    });
  }

  function handleNext() {
    setActiveStep((prevActiveStep) =>
      Math.min(prevActiveStep + 1, steps.length - 1)
    );
  }

  function handleBack() {
    setActiveStep((prevActiveStep) => Math.max(prevActiveStep - 1, 0));
  }

  function onSubmit(_data: QuizForm) {
    handleNext();
  }

  return (
    <Box>
      <Snackbar
        open={showAlert}
        anchorOrigin={{ horizontal: 'center', vertical: 'bottom' }}
        autoHideDuration={2000}
        onClose={handleAlertClose}
      >
        {isUpdateSuccess ? (
          <Alert severity={isUpdateSuccess ? 'success' : 'error'}>
            {isUpdateSuccess ? 'Quiz updated' : 'Something went wrong'}
          </Alert>
        ) : undefined}
      </Snackbar>
      <Typography variant="h1">
        <span>Edit your </span>
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
                  <Stack direction="row" gap={2} sx={{ marginLeft: 'auto' }}>
                    <Button
                      variant="outlined"
                      startIcon={
                        isUpdateLoading ? <LoadingCircle /> : undefined
                      }
                      endIcon={<SaveIcon />}
                      onClick={handleSaveClick}
                    >
                      Save
                    </Button>
                    <NextButton activeStep={activeStep} maxSteps={steps.length}>
                      {steps.at(activeStep)?.nextLabel}
                    </NextButton>
                  </Stack>
                </CardActions>
              </Card>
            </form>
          </FormProvider>
        </Grid>
      </Grid>
    </Box>
  );
}
