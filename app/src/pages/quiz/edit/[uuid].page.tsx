import GradientWord from '@/components/GradientWord';

import OverviewForm from '@/page-components/quiz/create/OverviewForm';
import SummaryForm from '@/page-components/quiz/create/SummaryForm';
import { defaultOverviewFormData, defaultQuestionsFormData } from '@/page-components/quiz/quiz-form-data';
import DeleteQuizDialog from '@/page-components/quiz/edit/DeleteQuizDialog';
import OverviewFormPlaceholder from '@/page-components/quiz/edit/OverviewFormPlaceholder';
import DeleteIcon from '@mui/icons-material/Delete';
import { Box, Typography, Grid, Card, CardContent, Stepper, Step, StepLabel, Button, Stack } from '@mui/material';
import { QueryClient, dehydrate, useQueryClient } from '@tanstack/react-query';
import { GetServerSideProps, InferGetServerSidePropsType } from 'next';
import { useRouter } from 'next/router';
import { useEffect, useMemo, useState } from 'react';
import { QuizOverviewForm, QuizQuestionsForm } from '@/page-components/quiz/quiz-form-schema';
import QuestionsForm from '@/page-components/quiz/create/QuestionsForm';
import { authOptions } from '@/pages/api/auth/[...nextauth].page';
import { getServerSession } from 'next-auth';
import { fetchQuiz, useQuizQuery } from '@/data/useQuizQuery';
import { throwOnError, UpdateQuizRequest } from '@/api-client';
import { useUpdateQuizMutation } from '@/data/useUpdateQuizMutation';
import { useToastStore } from '@/persistence/taost.store';
import { useDeleteQuizMutation } from '@/data/useDeleteQuizMutation';
import LoadingCircle from '@/components/LoadingCircle';
import { getImageName, getImageUrl } from '@/utilities/getImageUrl';
import { useUploadFileMutation } from '@/data/useUploadFileMutation';
import { useDeleteFileMutation } from '@/data/useDeleteFileMutation';
import { raise } from '@/utilities/errorHandling';
import { getBase64 } from '@/data/getBase64';

export const getServerSideProps: GetServerSideProps<{ uuid: string }> = async (ctx) => {
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
        }),
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

export default function QuizCreatePage({ uuid }: InferGetServerSidePropsType<typeof getServerSideProps>) {
  const queryClient = useQueryClient();
  const router = useRouter();
  const toastStore = useToastStore();

  const { data: quiz } = useQuizQuery(uuid);
  const [activeStep, setActiveStep] = useState(0);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [overviewFormData, setOverviewFormData] = useState<QuizOverviewForm>(defaultOverviewFormData);
  const [questionsFormData, setQuestionsFormData] = useState<QuizQuestionsForm>(defaultQuestionsFormData);
  const {
    mutateAsync: uploadFile,
    isPending: isUploadFilePending,
    isSuccess: isUploadFileSuccess,
  } = useUploadFileMutation();
  const {
    mutateAsync: deleteFile,
    isPending: isDeleteFilePending,
    isSuccess: isDeleteFileSuccess,
  } = useDeleteFileMutation();
  const {
    mutateAsync: updateQuiz,
    isPending: isUpdatePending,
    isSuccess: isUpdateSuccess,
  } = useUpdateQuizMutation(uuid);
  const {
    mutateAsync: deleteQuiz,
    isPending: isDeletePending,
    isSuccess: isDeleteSuccess,
  } = useDeleteQuizMutation(uuid);

  const isPending = useMemo(
    () =>
      [isUploadFilePending, isDeleteFilePending, isUpdatePending, isDeletePending].some(
        (isMutationPending) => isMutationPending,
      ),
    [isDeleteFilePending, isDeletePending, isUpdatePending, isUploadFilePending],
  );
  const isSuccess = useMemo(
    () =>
      [isUploadFileSuccess, isDeleteFileSuccess, isUpdateSuccess, isDeleteSuccess].some(
        (isMutationSuccess) => isMutationSuccess,
      ),
    [isDeleteFileSuccess, isDeleteSuccess, isUpdateSuccess, isUploadFileSuccess],
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
                  url: getImageUrl(quiz.imageUrl),
                }
              : undefined,
        },
      });
      setQuestionsFormData({
        questions:
          quiz.questions.map((question) => ({
            uuid: question.uuid,
            title: question.title,
            questionImage: {
              data: {
                file: null,
              },
              preview:
                question.imageUrl != null
                  ? {
                      url: getImageUrl(question.imageUrl),
                    }
                  : undefined,
            },
            answers:
              question.answers.map((answer) => ({
                uuid: answer.uuid,
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
                      url: getImageUrl(question.explanationImageUrl),
                    }
                  : undefined,
            },
          })) ?? [],
      });
    }
  }, [quiz]);

  async function handleSaveClick() {
    if (quiz == null) {
      raise('Cannot save quiz, because quiz was null.');
    }
    try {
      const { title, description, image } = overviewFormData;
      const { questions } = questionsFormData;

      let imageUrl = quiz.imageUrl;
      // Delete image
      if (imageUrl != null && (image.data.file != null || image.preview == null)) {
        await deleteFile({ filename: getImageName(imageUrl) });
        imageUrl = null;
      }
      // Upload image
      if (image.data.file != null) {
        const { url } = await uploadFile({
          file: await getBase64(image.data.file),
          filename: image.data.file.name,
        });
        imageUrl = url;
      }

      const requestData: UpdateQuizRequest = {
        title,
        description: description ?? '',
        imageUrl,
        isPublished: true,
        questions: [],
      };

      for (let questionIndex = 0; questionIndex < questions.length; questionIndex++) {
        const question = questions[questionIndex];
        // Delete question image
        let questionImageUrl = quiz.questions.at(questionIndex)?.imageUrl;
        if (
          questionImageUrl != null &&
          (question.questionImage.data.file != null || question.questionImage.preview == null)
        ) {
          await deleteFile({
            filename: getImageName(questionImageUrl),
          });
          questionImageUrl = null;
        }
        // Upload question image
        if (question.questionImage.data.file != null) {
          const { url } = await uploadFile({
            file: await getBase64(question.questionImage.data.file),
            filename: question.questionImage.data.file.name,
          });
          questionImageUrl = url;
        }
        // Delete question explanation image
        let questionExplanationImageUrl = quiz.questions.at(questionIndex)?.explanationImageUrl;
        if (
          questionExplanationImageUrl != null &&
          (question.explanationImage.data.file != null || question.explanationImage.preview == null)
        ) {
          await deleteFile({
            filename: getImageName(questionExplanationImageUrl),
          });
          questionExplanationImageUrl = null;
        }
        // Upload question explanation image
        if (question.explanationImage.data.file != null) {
          const { url } = await uploadFile({
            file: await getBase64(question.explanationImage.data.file),
            filename: question.explanationImage.data.file.name,
          });
          questionExplanationImageUrl = url;
        }

        // Update question data
        requestData.questions.push({
          uuid: question.uuid ?? '',
          title: question.title,
          description: '',
          imageUrl: questionImageUrl ?? null,
          explanation: question.explanation ?? '',
          explanationImageUrl: questionExplanationImageUrl ?? null,
          answers: question.answers.map((answer) => ({
            uuid: answer.uuid ?? '',
            title: answer.title,
            description: '',
            isCorrect: answer.isCorrect,
            imageUrl: null,
          })),
        });
      }

      await updateQuiz(requestData);

      // Refetch quiz
      toastStore.addToast('Quiz updated!', 'success');
      queryClient.invalidateQueries({ queryKey: ['getQuizzesInfinite'] });
      await router.push('/');
      queryClient.invalidateQueries({ queryKey: ['quiz', uuid] });
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
      setDialogOpen(false);
      await router.push('/');
    } catch (error) {
      toastStore.addToast('Could not delete quiz!', 'error');
    }
  }

  const backLabel = steps.at(activeStep)?.backLabel ?? null;
  const nextLabel = steps.at(activeStep)?.nextLabel ?? null;

  function handleNext() {
    setActiveStep((prevActiveStep) => Math.min(prevActiveStep + 1, steps.length - 1));
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
          <Stack direction="row" gap={2} flexWrap="wrap" sx={{ marginLeft: 'auto' }}>
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
                  isDisabled={isPending || isSuccess}
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
