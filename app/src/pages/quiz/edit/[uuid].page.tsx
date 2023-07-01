import GradientWord from '@/components/GradientWord';
import LoadingCircle from '@/components/LoadingCircle';
import { useAuthHeader } from '@/custom-hooks/useAuthHeader';
import { useRedirectOnUnauthenticated } from '@/custom-hooks/useRedirectOnUnauthenticated';
import {
  createQuestionGQL,
  updateQuizGQL,
  updateQuestionGQL,
  updateAnswerGQL,
  createAnswerGQL,
  deleteAnswerGQL,
  deleteQuestionGQL,
  deleteQuizGQL,
} from '@/graphql/crudQuiz';
import {
  QuizInput,
  QuestionInput,
  AnswerInput,
  Exact,
} from '@/graphql/generated/graphql';
import { getMyQuizzesByUuidGQL } from '@/graphql/myQuizzes';
import BackButton from '@/page-components/quiz/create/BackButton';
import NextButton from '@/page-components/quiz/create/NextButton';
import OverviewForm from '@/page-components/quiz/create/OverviewForm';
import QuestionsForm from '@/page-components/quiz/create/QuestionsForm';
import SummaryForm from '@/page-components/quiz/create/SummaryForm';
import {
  QuizForm,
  defaultQuizFormData,
} from '@/page-components/quiz/create/quiz-form-data';
import DeleteQuizDialog from '@/page-components/quiz/edit/DeleteQuizDialog';
import { authOptions } from '@/pages/api/auth/[...nextauth].page';
import { Delete as DeleteIcon, Save as SaveIcon } from '@mui/icons-material';
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
import {
  QueryClient,
  dehydrate,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';
import request from 'graphql-request';
import { GetServerSideProps, InferGetServerSidePropsType } from 'next';
import { getServerSession } from 'next-auth';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/router';
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

  const session = await getServerSession(ctx.req, ctx.res, authOptions);

  const queryClient = new QueryClient();
  await queryClient.prefetchQuery({
    queryKey: ['quiz', uuid],
    queryFn: () =>
      request(
        process.env.NEXT_PUBLIC_GRAPHQL_URL,
        getMyQuizzesByUuidGQL,
        {
          uuid,
          ownerId: session?.user?.id?.toString() ?? '',
        },
        {
          Authorization: `Bearer ${session?.user.acessToken}`,
        }
      ),
  });

  return {
    props: {
      uuid,
      dehydratedState: dehydrate(queryClient),
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
  const queryClient = useQueryClient();
  const router = useRouter();
  const { data: session, status } = useSession();
  const { authHeader } = useAuthHeader(session);
  const [activeStep, setActiveStep] = useState(0);
  const [alertType, setAlertType] = useState<'saved' | 'save-error' | null>(
    null
  );
  const [dialogOpen, setDialogOpen] = useState(false);

  const { ...methods } = useForm<QuizForm>({
    defaultValues: defaultQuizFormData,
  });
  const { reset, handleSubmit, watch } = methods;

  const { title, description, image, questions } = watch() as QuizForm;

  useRedirectOnUnauthenticated(status);

  const ownerId = session?.user?.id?.toString();
  const quizQuery = useQuery({
    queryKey: ['quiz', uuid],
    queryFn: () =>
      request(
        process.env.NEXT_PUBLIC_GRAPHQL_URL,
        getMyQuizzesByUuidGQL,
        {
          uuid,
          ownerId: ownerId ?? '',
        },
        authHeader
      ),
    staleTime: Infinity,
    enabled: ownerId != null,
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

  const createQuestionMutation = useMutation({
    mutationKey: ['createQuestion'],
    mutationFn: ({ data }: Exact<{ data: QuestionInput }>) =>
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
    mutationFn: ({ data }: Exact<{ data: AnswerInput }>) =>
      request(
        process.env.NEXT_PUBLIC_GRAPHQL_URL,
        createAnswerGQL,
        {
          data,
        },
        authHeader
      ),
  });
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
  const deleteQuizMutation = useMutation({
    mutationKey: ['deleteQuiz'],
    mutationFn: ({ id }: Exact<{ id: string }>) =>
      request(
        process.env.NEXT_PUBLIC_GRAPHQL_URL,
        deleteQuizGQL,
        {
          id,
        },
        authHeader
      ),
  });
  const deleteQuestionMutation = useMutation({
    mutationKey: ['deleteQuestion'],
    mutationFn: ({ id }: Exact<{ id: string }>) =>
      request(
        process.env.NEXT_PUBLIC_GRAPHQL_URL,
        deleteQuestionGQL,
        {
          id,
        },
        authHeader
      ),
  });
  const deleteAnswerMutation = useMutation({
    mutationKey: ['deleteAnswer'],
    mutationFn: ({ id }: Exact<{ id: string }>) =>
      request(
        process.env.NEXT_PUBLIC_GRAPHQL_URL,
        deleteAnswerGQL,
        {
          id,
        },
        authHeader
      ),
  });

  const isLoading =
    createQuestionMutation.isLoading ||
    createAnswerMutation.isLoading ||
    updateQuizMutation.isLoading ||
    updateQuestionMutation.isLoading ||
    updateAnswerMutation.isLoading ||
    deleteQuizMutation.isLoading ||
    deleteQuestionMutation.isLoading ||
    deleteAnswerMutation.isLoading;
  const isSuccess =
    createQuestionMutation.isSuccess &&
    createAnswerMutation.isSuccess &&
    updateQuizMutation.isSuccess &&
    updateQuestionMutation.isSuccess &&
    updateAnswerMutation.isSuccess;
  const isError =
    createQuestionMutation.isError ||
    createAnswerMutation.isError ||
    updateQuizMutation.isError ||
    updateQuestionMutation.isError ||
    updateAnswerMutation.isError;
  const isLoadingDelete =
    deleteQuizMutation.isLoading ||
    deleteQuestionMutation.isLoading ||
    deleteAnswerMutation.isLoading;

  async function handleSaveClick() {
    try {
      // Update quiz
      await updateQuizMutation.mutateAsync({
        id: quiz?.id ?? '',
        data: {
          title,
          description,
          published: true,
          owner: session?.user?.id?.toString() ?? '0',
        },
      });

      for (const question of questions) {
        let questionId: string;
        if (question.id == null) {
          // Create new question
          const res = await createQuestionMutation.mutateAsync({
            data: {
              title: question.title ?? '',
              quiz: quiz?.id ?? '',
            },
          });
          questionId = res.createQuestion?.data?.id ?? '';
        } else {
          // Update question
          await updateQuestionMutation.mutateAsync({
            id: question.id ?? '',
            data: {
              title: question.title ?? '',
            },
          });
          questionId = question.id;
        }

        for (const answer of question.answers) {
          // Create new answer
          if (answer.id == null) {
            await createAnswerMutation.mutateAsync({
              data: {
                title: answer.title ?? '',
                correct: answer.isCorrect,
                question: questionId,
              },
            });
          } else {
            // Update answer
            await updateAnswerMutation.mutateAsync({
              id: answer.id ?? '',
              data: {
                title: answer.title ?? '',
                correct: answer.isCorrect ?? false,
              },
            });
          }
        }
      }

      for (const originalQuestion of quiz?.attributes?.questions?.data ?? []) {
        for (const originalAnswer of originalQuestion.attributes?.answers
          ?.data ?? []) {
          // Delete unused question
          if (
            !questions.some((question) =>
              question.answers.some((answer) => answer.id === originalAnswer.id)
            )
          ) {
            await deleteAnswerMutation.mutateAsync({
              id: originalAnswer.id ?? '',
            });
          }
        }

        // Delete unused question
        if (
          !questions.some((question) => question.id === originalQuestion.id)
        ) {
          await deleteQuestionMutation.mutateAsync({
            id: originalQuestion.id ?? '',
          });
        }
      }

      // Refetch quiz
      setAlertType('saved');
      queryClient.invalidateQueries(['quiz', uuid]);
    } catch (error) {
      console.error(error);
      setAlertType('save-error');
    } finally {
    }
  }

  async function onDeleteDialogConfirm() {
    for (const question of questions) {
      for (const answer of question.answers) {
        // Delete answer
        if (answer.id != null) {
          await deleteAnswerMutation.mutateAsync({
            id: answer.id,
          });
        }
      }
      // Delete question
      if (question.id != null) {
        await deleteQuestionMutation.mutateAsync({
          id: question.id,
        });
      }
    }
    // Delete quiz
    if (quiz?.id != null) {
      await deleteQuizMutation.mutateAsync({
        id: quiz.id,
      });
    }
    await router.push('/');
    setDialogOpen(false);
  }

  function handleCloseAlert(_event: unknown, reason?: string) {
    if (reason === 'clickaway') {
      return;
    }
    setAlertType(null);
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
      <DeleteQuizDialog
        open={dialogOpen}
        setOpen={setDialogOpen}
        quizTitle={quiz?.attributes?.title ?? ''}
        onConfirm={onDeleteDialogConfirm}
        loading={isLoadingDelete}
      />
      <Snackbar
        open={alertType != null}
        anchorOrigin={{ horizontal: 'center', vertical: 'bottom' }}
        autoHideDuration={5000}
        onClose={handleCloseAlert}
      >
        <Box>
          {alertType === 'saved' && (
            <Alert severity="success">Quiz updated</Alert>
          )}
          {alertType === 'save-error' && (
            <Alert severity="error">Could not save the quiz</Alert>
          )}
        </Box>
      </Snackbar>
      <Typography variant="h1">
        <Stack direction="row" alignItems="center" flexWrap="wrap" gap={2}>
          <Box>
            <span>Edit your </span>
            <GradientWord>quiz</GradientWord>
            <span>.</span>
          </Box>
          <Stack
            direction="row"
            gap={2}
            flexWrap="wrap"
            sx={{ marginLeft: 'auto' }}
          >
            <Button
              variant="outlined"
              startIcon={isLoading ? <LoadingCircle /> : undefined}
              endIcon={<SaveIcon />}
              onClick={handleSaveClick}
            >
              Save
            </Button>
            <Button
              variant="outlined"
              color="error"
              endIcon={<DeleteIcon />}
              onClick={() => setDialogOpen(true)}
            >
              Delete this quiz
            </Button>
          </Stack>
        </Stack>
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
                </CardActions>
              </Card>
            </form>
          </FormProvider>
        </Grid>
      </Grid>
    </Box>
  );
}
