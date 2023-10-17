import GradientWord from '@/components/GradientWord';
import { useAuthHeader } from '@/custom-hooks/useAuthHeader';
import { useHandleGqlUnauthorized } from '@/custom-hooks/useHandleGqlUnauthorized';
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
  UploadFileEntity,
} from '@/graphql/generated/graphql';
import { getMyQuizzesByUuidGQL } from '@/graphql/myQuizzes';
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
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import {
  QuizOverviewForm,
  QuizQuestionsForm,
} from '@/page-components/quiz/quiz-form-schema';
import LoadingCircle from '@/components/LoadingCircle';
import { getBackendImageUrl } from '@/utilities/getImageUrl';
import QuestionsForm from '@/page-components/quiz/create/QuestionsForm';
import { authOptions } from '@/pages/api/auth/[...nextauth].page';
import { getServerSession } from 'next-auth';

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

  async function fetchMyQuizzedByUuid(uuid: string) {
    return request(
      process.env.NEXT_PUBLIC_GRAPHQL_URL,
      getMyQuizzesByUuidGQL,
      {
        uuid,
        ownerId: session?.user?.id?.toString() ?? '',
      },
      {
        Authorization: `Bearer ${session?.user.acessToken}`,
      }
    );
  }

  await queryClient.prefetchQuery({
    queryKey: ['quiz', uuid],
    queryFn: () => fetchMyQuizzedByUuid(uuid),
  });

  if (
    (
      queryClient.getQueryData(['quiz', uuid]) as Awaited<
        ReturnType<typeof fetchMyQuizzedByUuid>
      >
    )?.quizzes?.data?.length === 0
  ) {
    return {
      notFound: true,
    };
  }

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
  const { authHeader } = useAuthHeader();
  const [activeStep, setActiveStep] = useState(0);
  const [alertType, setAlertType] = useState<'saved' | 'save-error' | null>(
    null
  );
  const [dialogOpen, setDialogOpen] = useState(false);
  const [overviewFormData, setOverviewFormData] = useState<QuizOverviewForm>(
    defaultOverviewFormData
  );
  const [questionsFormData, setQuestionsFormData] = useState<QuizQuestionsForm>(
    defaultQuestionsFormData
  );

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
      setOverviewFormData({
        title: quiz.attributes?.title ?? '',
        description: quiz.attributes?.description ?? '',
        image: {
          data: {
            file: null,
          },
          preview:
            quiz?.attributes?.image?.data?.attributes?.url != null
              ? {
                  url: getBackendImageUrl(
                    quiz?.attributes?.image?.data?.attributes?.url
                  ),
                  name: quiz?.attributes?.image?.data?.attributes?.name ?? '',
                }
              : undefined,
        },
      });
      setQuestionsFormData({
        questions:
          quiz?.attributes?.questions?.data.map((question) => ({
            id: question.id ?? '',
            title: question.attributes?.title ?? '',
            questionImage: {
              data: {
                file: null,
              },
              preview:
                question.attributes?.questionImage?.data?.attributes?.url !=
                null
                  ? {
                      url: getBackendImageUrl(
                        question.attributes?.questionImage?.data?.attributes
                          ?.url
                      ),
                      name:
                        question.attributes?.questionImage?.data?.attributes
                          ?.name ?? '',
                    }
                  : undefined,
            },
            answers:
              question.attributes?.answers?.data.map((answer) => ({
                id: answer.id ?? '',
                title: answer.attributes?.title ?? '',
                isCorrect: answer.attributes?.correct ?? false,
              })) ?? [],
            explanation: question.attributes?.explanation ?? '',
            explanationImage: {
              data: {
                file: null,
              },
              preview:
                question.attributes?.explanationImage?.data?.attributes?.url !=
                null
                  ? {
                      url: getBackendImageUrl(
                        question.attributes?.explanationImage?.data?.attributes
                          ?.url
                      ),
                      name:
                        question.attributes?.explanationImage?.data?.attributes
                          ?.name ?? '',
                    }
                  : undefined,
            },
          })) ?? [],
      });
    }
  }, [quiz]);

  const createQuestionMutation = useMutation({
    mutationKey: ['createQuestion'],
    mutationFn: ({ data }: { data: QuestionInput }) =>
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
    mutationFn: ({ data }: { data: AnswerInput }) =>
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
    mutationFn: ({ id, data }: { id: string; data: QuizInput }) =>
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
    mutationFn: ({ id, data }: { id: string; data: QuestionInput }) =>
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
    mutationFn: ({ id, data }: { id: string; data: AnswerInput }) =>
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
    mutationFn: ({ id }: { id: string }) =>
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
    mutationFn: ({ id }: { id: string }) =>
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
    mutationFn: ({ id }: { id: string }) =>
      request(
        process.env.NEXT_PUBLIC_GRAPHQL_URL,
        deleteAnswerGQL,
        {
          id,
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
      return response.json() as any;
    },
  });
  const deleteImageMutation = useMutation({
    mutationKey: ['deleteImage'],
    mutationFn: async ({ id }: { id: string }): Promise<void> => {
      await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/upload/files/${id}`,
        {
          method: 'DELETE',
          headers: {
            ...authHeader,
          },
        }
      );
    },
  });

  const createOrUpdateMutations = [
    createQuestionMutation,
    createAnswerMutation,
    updateQuizMutation,
    updateQuestionMutation,
    updateAnswerMutation,
    uploadImageMutation,
  ];
  const deleteMutations = [
    deleteQuizMutation,
    deleteQuestionMutation,
    deleteAnswerMutation,
    deleteImageMutation,
  ];
  const mutations = [...createOrUpdateMutations, ...deleteMutations];

  useHandleGqlUnauthorized([
    quizQuery.error,
    ...mutations.map((mutation) => mutation.error),
  ]);
  useRedirectOnUnauthenticated(status);

  async function handleSaveClick() {
    const { title, description, image } = overviewFormData;
    const { questions } = questionsFormData;
    try {
      let imageId = quiz?.attributes?.image?.data?.id ?? null;
      // Delete image
      if (
        imageId != null &&
        (image.data.file != null || image.preview == null)
      ) {
        await deleteImageMutation.mutateAsync({
          id: imageId,
        });
        imageId = null;
      }
      // Upload image
      if (image.data.file != null) {
        const uploadImageResponse = await uploadImageMutation.mutateAsync({
          file: image.data.file,
        });
        imageId = uploadImageResponse.at(0)?.id?.toString() ?? '';
      }

      // Update quiz
      await updateQuizMutation.mutateAsync({
        id: quiz?.id ?? '',
        data: {
          title: title.trim(),
          description: description?.trim(),
          published: true,
          owner: session?.user?.id?.toString() ?? '0',
          image: imageId,
        },
      });

      for (
        let questionIndex = 0;
        questionIndex < questions.length;
        questionIndex++
      ) {
        const question = questions.at(questionIndex)!;
        let questionId: string;
        let questionImageId =
          quiz?.attributes?.questions?.data?.at(questionIndex)?.attributes
            ?.questionImage?.data?.id ?? null;
        // Delete question image
        if (
          questionImageId != null &&
          (question.questionImage.data.file != null ||
            question.questionImage.preview == null)
        ) {
          await deleteImageMutation.mutateAsync({
            id: questionImageId,
          });
          questionImageId = null;
        }
        // Upload question image
        if (question.questionImage.data.file != null) {
          const uploadImageResponse = await uploadImageMutation.mutateAsync({
            file: question.questionImage.data.file,
          });
          questionImageId = uploadImageResponse.at(0)?.id?.toString() ?? '';
        }
        let explanationImageId =
          quiz?.attributes?.questions?.data?.at(questionIndex)?.attributes
            ?.explanationImage?.data?.id ?? null;
        // Delete explanation image
        if (
          explanationImageId != null &&
          (question.explanationImage.data.file != null ||
            question.explanationImage.preview == null)
        ) {
          await deleteImageMutation.mutateAsync({
            id: explanationImageId,
          });
          explanationImageId = null;
        }
        // Upload question image
        if (question.explanationImage.data.file != null) {
          const uploadImageResponse = await uploadImageMutation.mutateAsync({
            file: question.explanationImage.data.file,
          });
          explanationImageId = uploadImageResponse.at(0)?.id?.toString() ?? '';
        }
        if (question.id == null) {
          // Create new question
          const res = await createQuestionMutation.mutateAsync({
            data: {
              title: question.title.trim() ?? '',
              quiz: quiz?.id ?? '',
            },
          });
          questionId = res.createQuestion?.data?.id ?? '';
        } else {
          // Update question
          await updateQuestionMutation.mutateAsync({
            id: question.id ?? '',
            data: {
              title: question.title.trim() ?? '',
              explanation: question.explanation?.trim() ?? '',
              questionImage: questionImageId,
              explanationImage: explanationImageId,
            },
          });
          questionId = question.id;
        }

        for (const answer of question.answers) {
          // Create new answer
          if (answer.id == null) {
            await createAnswerMutation.mutateAsync({
              data: {
                title: answer.title.trim() ?? '',
                correct: answer.isCorrect,
                question: questionId,
              },
            });
          } else {
            // Update answer
            await updateAnswerMutation.mutateAsync({
              id: answer.id ?? '',
              data: {
                title: answer.title.trim() ?? '',
                correct: answer.isCorrect ?? false,
              },
            });
          }
        }
      }

      for (const originalQuestion of quiz?.attributes?.questions?.data ?? []) {
        for (const originalAnswer of originalQuestion.attributes?.answers
          ?.data ?? []) {
          // Delete unused answer
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
          // Delete unused question image
          if (originalQuestion.attributes?.questionImage?.data?.id != null) {
            await deleteImageMutation.mutateAsync({
              id: originalQuestion.attributes?.questionImage?.data?.id,
            });
          }
          // Delete unused explanation image
          if (originalQuestion.attributes?.explanationImage?.data?.id != null) {
            await deleteImageMutation.mutateAsync({
              id: originalQuestion.attributes?.explanationImage?.data?.id,
            });
          }
          await deleteQuestionMutation.mutateAsync({
            id: originalQuestion.id ?? '',
          });
        }
      }

      // Refetch quiz
      setAlertType('saved');
      queryClient.invalidateQueries(['quiz', uuid]);
      queryClient.removeQueries(['allPublishedQuizzes']);
      queryClient.invalidateQueries(['allPublishedQuizzes']);
      await router.push('/');
    } catch (error) {
      console.error(error);
      setAlertType('save-error');
    } finally {
    }
  }

  async function onDeleteDialogConfirm() {
    const { questions } = questionsFormData;
    for (
      let questionIndex = 0;
      questionIndex < questions.length;
      questionIndex++
    ) {
      const question = questions.at(questionIndex)!;
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
      // Delete question image
      const questionImageId =
        quiz?.attributes?.questions?.data.at(questionIndex)?.attributes
          ?.questionImage?.data?.id;
      if (questionImageId != null) {
        await deleteImageMutation.mutateAsync({
          id: questionImageId,
        });
      }
      // Delete explanation image
      const explanationImageId =
        quiz?.attributes?.questions?.data.at(questionIndex)?.attributes
          ?.explanationImage?.data?.id;
      if (explanationImageId != null) {
        await deleteImageMutation.mutateAsync({
          id: explanationImageId,
        });
      }
    }

    // Delete quiz
    if (quiz?.id != null) {
      await deleteQuizMutation.mutateAsync({
        id: quiz.id,
      });

      // Delete image
      if (quiz?.attributes?.image?.data?.id != null) {
        await deleteImageMutation.mutateAsync({
          id: quiz?.attributes?.image?.data?.id,
        });
      }
    }

    queryClient.invalidateQueries(['allPublishedQuizzes']);
    await router.push('/');
    setDialogOpen(false);
  }

  const backLabel = steps.at(activeStep)?.backLabel ?? null;
  const nextLabel = steps.at(activeStep)?.nextLabel ?? null;

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

  return (
    <Box>
      <DeleteQuizDialog
        open={dialogOpen}
        setOpen={setDialogOpen}
        quizTitle={quiz?.attributes?.title ?? ''}
        onConfirm={onDeleteDialogConfirm}
        loading={deleteMutations.some((mutation) => mutation.isLoading)}
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
            <Alert severity="error">Could not save your quiz</Alert>
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
              variant="contained"
              color="error"
              startIcon={
                deleteMutations.some((mutation) => mutation.isLoading) ? (
                  <LoadingCircle />
                ) : undefined
              }
              endIcon={<DeleteIcon />}
              onClick={() => setDialogOpen(true)}
              disabled={deleteMutations.some(
                (mutation) => mutation.isLoading || mutation.isSuccess
              )}
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
                  isLoading={mutations.some((mutation) => mutation.isLoading)}
                  isDisabled={
                    mutations.some((mutation) => mutation.isLoading) ||
                    mutations.every((mutation) => mutation.isSuccess)
                  }
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
