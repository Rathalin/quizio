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
} from '@/graphql/crudQuiz';
import {
  QuizInput,
  QuestionInput,
  AnswerInput,
  UploadFileEntity,
} from '@/graphql/generated/graphql';
import { useMutation } from '@tanstack/react-query';
import request from 'graphql-request';
import router from 'next/router';
import { useSession } from 'next-auth/react';
import LoadingCircle from '@/components/LoadingCircle';
import { Publish as PublishIcon } from '@mui/icons-material';
import {
  QuizForm,
  defaultQuizFormData,
} from '@/page-components/quiz/create/quiz-form-data';
import { useAuthHeader } from '@/custom-hooks/useAuthHeader';
import { useRedirectOnUnauthenticated } from '@/custom-hooks/useRedirectOnUnauthenticated';
import { useStorage } from '@/custom-hooks/useStorage';
import { storageKeys } from '@/persistence/storage-keys';
import { useHandleGQLUnauthorized } from '@/custom-hooks/useHandleGQLUnauthorized';

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
  const { data: session, status } = useSession();
  const { authHeader } = useAuthHeader(session);
  const { getStorageItem, setStorageItem } = useStorage<QuizForm>(
    storageKeys.quizDraft
  );
  const [activeStep, setActiveStep] = useState(0);

  const { ...methods } = useForm<QuizForm>({
    defaultValues: defaultQuizFormData,
  });
  const { getValues, reset, handleSubmit, watch } = methods;
  useEffect(() => {
    reset(getStorageItem() as QuizForm);
  }, [getStorageItem, reset]);
  useEffect(() => {
    const subscription = watch((value) => {
      // Don't store image
      delete value.image;
      setStorageItem(value as QuizForm);
    });
    return () => subscription.unsubscribe();
  }, [setStorageItem, watch]);

  const { title, description, questions } = getValues() as QuizForm;

  const createQuizMutation = useMutation({
    mutationKey: ['createQuiz'],
    mutationFn: (data: QuizInput) =>
      request(
        process.env.NEXT_PUBLIC_GRAPHQL_URL,
        createQuizGQL,
        {
          data,
        },
        authHeader
      ),
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
        authHeader
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
        authHeader
      ),
  });
  const uploadImageMutation = useMutation({
    mutationKey: ['uploadImage'],
    mutationFn: async ({
      file,
    }: {
      file: File;
    }): Promise<[UploadFileEntity['attributes'] & { id: number }]> => {
      const formData = new FormData();
      formData.append('files', file);
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/upload`,
        {
          method: 'POST',
          body: formData,
          headers: {
            ...authHeader,
          },
        }
      );
      return response.json();
    },
  });
  useHandleGQLUnauthorized([
    createQuizMutation.error,
    createQuestionMutation.error,
    createAnswerMutation.error,
    uploadImageMutation.error,
  ]);

  useRedirectOnUnauthenticated(status);
  useHandleGQLUnauthorized([
    createQuizMutation.error,
    createQuestionMutation.error,
    createAnswerMutation.error,
    uploadImageMutation.error,
  ]);

  async function handleFinishQuizClick() {
    try {
      // Upload image
      const image = getValues('image');
      let imageId: string | null = null;
      if (image != null) {
        imageId =
          (await uploadImageMutation.mutateAsync({ file: image }))
            .at(0)
            ?.id?.toString() ?? '';
      }

      // Create quiz
      const res = await createQuizMutation.mutateAsync({
        title,
        description,
        published: true,
        image: imageId,
        owner: session?.user?.id?.toString() ?? '0',
      });

      // Create questions
      for (const question of questions) {
        const questionData = await createQuestionMutation.mutateAsync({
          title: question.title,
          quiz: res.createQuiz?.data?.id,
        });

        // Create answers
        for (const answer of question.answers) {
          await createAnswerMutation.mutateAsync({
            title: answer.title,
            correct: answer.isCorrect,
            question: questionData.createQuestion?.data?.id,
          });
        }
      }
      await router.push('/');
      reset(defaultQuizFormData);
      setStorageItem(defaultQuizFormData);
    } catch (error) {
      console.error(error);
    }
  }

  function handleNext() {
    setActiveStep((prevActiveStep) =>
      Math.min(prevActiveStep + 1, steps.length - 1)
    );
  }

  function handleBack() {
    setActiveStep((prevActiveStep) => Math.max(prevActiveStep - 1, 0));
  }

  function onSubmit() {
    handleNext();
  }

  const isLoadingCreate =
    createQuizMutation.isLoading ||
    createQuestionMutation.isLoading ||
    createAnswerMutation.isLoading;
  const isSuccessCreate =
    createQuizMutation.isSuccess &&
    createQuestionMutation.isSuccess &&
    createAnswerMutation.isSuccess;

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
                      startIcon={isLoadingCreate ? <LoadingCircle /> : null}
                      endIcon={<PublishIcon />}
                      disabled={isLoadingCreate || isSuccessCreate}
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
