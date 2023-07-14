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
import { useMutation } from '@tanstack/react-query';
import request from 'graphql-request';
import { useSession } from 'next-auth/react';
import { useAuthHeader } from '@/custom-hooks/useAuthHeader';
import { useRedirectOnUnauthenticated } from '@/custom-hooks/useRedirectOnUnauthenticated';
import { useHandleGQLUnauthorized } from '@/custom-hooks/useHandleGQLUnauthorized';
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
  const { data: session, status } = useSession();
  const { authHeader } = useAuthHeader(session);
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
  const mutations = [
    createQuizMutation,
    createQuestionMutation,
    createAnswerMutation,
    uploadImageMutation,
  ];
  useHandleGQLUnauthorized(mutations.map((mutation) => mutation.error));
  useRedirectOnUnauthenticated(status);

  async function handleFinishQuizClick() {
    const { title, description, image } = overviewFormData;
    const { questions } = questionsFormData;
    try {
      // Upload image
      let imageId: string | null = null;
      if (image != null) {
        imageId =
          (await uploadImageMutation.mutateAsync({ file: image }))
            .at(0)
            ?.id?.toString() ?? '';
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
      await router.push('/');
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
            />
          )}
          {steps[activeStep].title === 'Summary' && (
            <SummaryForm
              overviewFormData={overviewFormData}
              questionsFormData={questionsFormData}
              backLabel={backLabel}
              onBack={() => handleBack()}
              showPublishButton
              onPublish={() => handleFinishQuizClick()}
              isPublishing={
                mutations.some((mutation) => mutation.isLoading) ||
                mutations.some((mutation) => mutation.isSuccess)
              }
            />
          )}
        </Grid>
      </Grid>
    </Box>
  );
}
