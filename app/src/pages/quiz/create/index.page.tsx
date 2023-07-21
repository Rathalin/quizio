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
import { useState } from 'react';
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
import { useMutation, useQueryClient } from '@tanstack/react-query';
import request from 'graphql-request';
import { useSession } from 'next-auth/react';
import { useAuthHeader } from '@/custom-hooks/useAuthHeader';
import { useRedirectOnUnauthenticated } from '@/custom-hooks/useRedirectOnUnauthenticated';
import { useHandleGqlUnauthorized } from '@/custom-hooks/useHandleGqlUnauthorized';
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
  const { data: session, status } = useSession();
  const { authHeader } = useAuthHeader();
  const [activeStep, setActiveStep] = useState(0);
  const [overviewFormData, setOverviewFormData] = useState<QuizOverviewForm>(
    defaultOverviewFormData
  );
  const [questionsFormData, setQuestionsFormData] = useState<QuizQuestionsForm>(
    defaultQuestionsFormData
  );

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
    }): Promise<[UploadFileEntity['attributes'] & { id: string }]> => {
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
  const mutations = [
    createQuizMutation,
    createQuestionMutation,
    createAnswerMutation,
    uploadImageMutation,
  ];
  useHandleGqlUnauthorized(mutations.map((mutation) => mutation.error));
  useRedirectOnUnauthenticated(status);

  async function handleFinishQuizClick() {
    const { title, description, image } = overviewFormData;
    const { questions } = questionsFormData;
    try {
      // Upload image
      let imageId: string | null = null;
      if (image.file != null) {
        console.log(image);
        imageId =
          (await uploadImageMutation.mutateAsync({ file: image.file })).at(0)
            ?.id ?? '';
      }
      // Create quiz
      const res = await createQuizMutation.mutateAsync({
        title: title.trim(),
        description: description?.trim(),
        published: true,
        image: imageId,
        owner: session?.user?.id?.toString() ?? '0',
      });
      // Create questions
      for (const question of questions) {
        const questionData = await createQuestionMutation.mutateAsync({
          title: question.title.trim(),
          quiz: res.createQuiz?.data?.id,
          explanation: question.explanation?.trim(),
        });
        // Create answers
        for (const answer of question.answers) {
          await createAnswerMutation.mutateAsync({
            title: answer.title.trim(),
            correct: answer.isCorrect,
            question: questionData.createQuestion?.data?.id,
          });
        }
      }

      queryClient.invalidateQueries(['allPublishedQuizzes']);
      await router.push('/');
      resetQuizLocalStorage();
      setOverviewFormData(defaultOverviewFormData);
      setQuestionsFormData(defaultQuestionsFormData);
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
              isLoading={mutations.some((mutation) => mutation.isLoading)}
              isDisabled={mutations.some(
                (mutation) => mutation.isLoading || mutation.isSuccess
              )}
              editMode={false}
            />
          )}
        </Grid>
      </Grid>
    </Box>
  );
}
