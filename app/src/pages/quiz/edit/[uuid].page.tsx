import GradientWord from '@/components/GradientWord';

import OverviewForm from '@/page-components/quiz/create/OverviewForm';
import SummaryForm from '@/page-components/quiz/create/SummaryForm';
import {
  defaultOverviewFormData,
  defaultQuestionsFormData,
} from '@/page-components/quiz/quiz-form-data';
import DeleteQuizDialog from '@/page-components/quiz/edit/DeleteQuizDialog';
import OverviewFormPlaceholder from '@/page-components/quiz/edit/OverviewFormPlaceholder';
import DeleteIcon from '@mui/icons-material/Delete';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  Stepper,
  Step,
  StepLabel,
  Button,
  Stack,
} from '@mui/material';
import { QueryClient, dehydrate, useQueryClient } from '@tanstack/react-query';
import { GetServerSideProps, InferGetServerSidePropsType } from 'next';
import { useRouter } from 'next/router';
import { useEffect, useMemo, useState } from 'react';
import {
  QuizOverviewForm,
  QuizQuestionsForm,
} from '@/page-components/quiz/quiz-form-schema';
import QuestionsForm from '@/page-components/quiz/create/QuestionsForm';
import { authOptions } from '@/pages/api/auth/[...nextauth].page';
import { getServerSession } from 'next-auth';
import { fetchQuiz, useQuizQuery } from '@/data/useQuizQuery';
import { throwOnError } from '@/api-client';
import { useUpdateQuizMutation } from '@/data/useUpdateQuizMutation';
import { useToastStore } from '@/persistence/taost.store';
import { useDeleteQuizMutation } from '@/data/useDeleteQuizMutation';
import LoadingCircle from '@/components/LoadingCircle';
import { getBackendImageUrl } from '@/utilities/getImageUrl';
import { useUploadFileMutation } from '@/data/useUploadFileMutation';
import { useDeleteFileMutation } from '@/data/useDeleteFileMutation';

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
      throwOnError(() =>
        fetchQuiz(uuid, {
          Authorization: `Bearer ${session?.user?.accessToken}`,
        })
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
  const toastStore = useToastStore();

  const { data: quiz } = useQuizQuery(uuid);
  const [activeStep, setActiveStep] = useState(0);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [overviewFormData, setOverviewFormData] = useState<QuizOverviewForm>(
    defaultOverviewFormData
  );
  const [questionsFormData, setQuestionsFormData] = useState<QuizQuestionsForm>(
    defaultQuestionsFormData
  );
  const {
    mutateAsync: uploadFile,
    isPending: isUploadFilePending,
    isError: isUploadFileError,
  } = useUploadFileMutation();
  const {
    mutateAsync: deleteFile,
    isPending: isDeleteFilePending,
    isError: isDeleteFileError,
  } = useDeleteFileMutation();
  const {
    mutateAsync: updateQuiz,
    isPending: isUpdatePending,
    isError: isUpdateError,
  } = useUpdateQuizMutation(uuid);
  const {
    mutateAsync: deleteQuiz,
    isPending: isDeletePending,
    isSuccess: isDeleteSuccess,
    isError: isDeleteError,
  } = useDeleteQuizMutation(uuid);

  const isPending = useMemo(
    () =>
      [
        isUploadFilePending,
        isDeleteFilePending,
        isUpdatePending,
        isDeletePending,
      ].some((isMutationPending) => isMutationPending),
    [isDeleteFilePending, isDeletePending, isUpdatePending, isUploadFilePending]
  );
  const isError = useMemo(
    () =>
      [isUploadFileError, isDeleteFileError, isUpdateError, isDeleteError].some(
        (isMutationError) => isMutationError
      ),
    [isDeleteFileError, isDeleteError, isUpdateError, isUploadFileError]
  );

  useEffect(() => {
    if (quiz != null) {
      setOverviewFormData({
        title: quiz.title,
        description: quiz.description,
        image: {
          data: {
            file: null,
          },
          preview:
            quiz.imageUrl != null
              ? {
                  url: getBackendImageUrl(quiz.imageUrl),
                  name: '',
                }
              : undefined,
        },
      });
      setQuestionsFormData({
        questions:
          quiz.questions.map((question) => ({
            id: question.uuid,
            title: question.title,
            questionImage: {
              data: {
                file: null,
              },
              preview:
                question.imageUrl != null
                  ? {
                      url: getBackendImageUrl(question.imageUrl),
                      name: '',
                    }
                  : undefined,
            },
            answers:
              question.answers.map((answer) => ({
                id: answer.uuid,
                title: answer.title,
                isCorrect: answer.isCorrect,
              })) ?? [],
            explanation: question.explanation ?? '',
            explanationImage: {
              data: {
                file: null,
              },
              preview:
                question.explanationImageUrl != null
                  ? {
                      url: getBackendImageUrl(question.explanationImageUrl),
                      name: '',
                    }
                  : undefined,
            },
          })) ?? [],
      });
    }
  }, [quiz]);

  async function handleSaveClick() {
    try {
      await updateQuiz({
        title: overviewFormData.title,
        description: overviewFormData.description ?? '',
        // imageUrl: overviewFormData.image,
        imageUrl: null,
        isPublished: true,
        questions: questionsFormData.questions.map((question) => ({
          uuid: question.id ?? '',
          title: question.title,
          description: '',
          imageUrl: null,
          explanation: question.explanation ?? '',
          explanationImageUrl: null,
          answers: question.answers.map((answer) => ({
            uuid: answer.id ?? '',
            title: answer.title,
            description: '',
            isCorrect: answer.isCorrect,
            imageUrl: null,
          })),
        })),
      });

      // Refetch quiz
      toastStore.addToast('Quiz updated!', 'success');
      queryClient.invalidateQueries({ queryKey: ['quiz', uuid] });
      queryClient.removeQueries({ queryKey: ['getQuizzesInfinite'] });
      queryClient.invalidateQueries({ queryKey: ['getQuizzesInfinite'] });
      router.push('/');
    } catch (error) {
      console.error('Update quiz error', error);
      toastStore.addToast('Could not update quiz!', 'error');
    }
  }

  async function onDeleteDialogConfirm() {
    try {
      await deleteQuiz();

      toastStore.addToast('Quiz deleted.', 'success');
      queryClient.invalidateQueries({ queryKey: ['getQuizzesInfinite'] });
      await router.push('/');
      setDialogOpen(false);
    } catch (error) {
      toastStore.addToast('Could not delete quiz!', 'error');
    }
  }

  const backLabel = steps.at(activeStep)?.backLabel ?? null;
  const nextLabel = steps.at(activeStep)?.nextLabel ?? null;

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
      {quiz != null && (
        <DeleteQuizDialog
          open={dialogOpen}
          setOpen={setDialogOpen}
          quizTitle={quiz.title}
          onConfirm={onDeleteDialogConfirm}
          loading={isDeletePending}
        />
      )}
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
              variant="contained"
              color="error"
              startIcon={isDeletePending ? <LoadingCircle /> : undefined}
              endIcon={<DeleteIcon />}
              onClick={() => setDialogOpen(true)}
              disabled={isDeletePending || isDeleteSuccess}
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
          {quiz != null ? (
            <>
              {steps[activeStep].title === 'Overview' && (
                <OverviewForm
                  defaultData={overviewFormData}
                  onSubmit={(data) => {
                    setOverviewFormData(data);
                    handleNext();
                  }}
                  backLabel={backLabel}
                  nextLabel={nextLabel}
                  editMode={true}
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
                  editMode={true}
                />
              )}
              {steps[activeStep].title === 'Summary' && (
                <SummaryForm
                  overviewFormData={overviewFormData}
                  questionsFormData={questionsFormData}
                  backLabel={backLabel}
                  onBack={() => handleBack()}
                  editMode={true}
                  onSubmit={handleSaveClick}
                  isPending={isPending}
                  isDisabled={isPending || isError}
                />
              )}
            </>
          ) : (
            <OverviewFormPlaceholder />
          )}
        </Grid>
      </Grid>
    </Box>
  );
}
