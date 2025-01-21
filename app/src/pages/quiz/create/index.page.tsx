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
import { useToastStore } from '@/persistence/taost.store';
import { useUploadFileMutation } from '@/data/useUploadFileMutation';
import { getBase64 } from '@/data/getBase64';

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
  const toastStore = useToastStore();
  const [activeStep, setActiveStep] = useState(0);
  const [overviewFormData, setOverviewFormData] = useState<QuizOverviewForm>(
    defaultOverviewFormData
  );
  const [questionsFormData, setQuestionsFormData] = useState<QuizQuestionsForm>(
    defaultQuestionsFormData
  );

  const { mutateAsync: uploadFile } = useUploadFileMutation();
  const {
    mutateAsync: createQuiz,
    isPending,
    isSuccess,
  } = useCreateQuizMutation();

  async function uploadImage(file: File | null): Promise<string | null> {
    if (file == null) {
      return null;
    }
    try {
      const { url } = await uploadFile({
        filename: file.name,
        file: await getBase64(file),
      });
      return url;
    } catch (error) {
      console.error(error);
      toastStore.addToast('Could not upload image!', 'error');
      return null;
    }
  }

  async function handleFinishQuizClick() {
    // Upload quiz image
    let imageUrls: {
      url: string | null;
      questionUrls: { question: string | null; explanation: string | null }[];
    } = {
      url: null,
      questionUrls: [],
    };
    imageUrls.url = await uploadImage(overviewFormData.image.data.file);

    // Upload question images

    for (let question of questionsFormData.questions) {
      imageUrls.questionUrls.push({
        question: await uploadImage(question.questionImage.data.file),
        explanation: await uploadImage(question.explanationImage.data.file),
      });
    }

    try {
      await createQuiz({
        title: overviewFormData.title,
        description: overviewFormData.description ?? null,
        isPublished: true,
        imageUrl: imageUrls.url,
        questions: questionsFormData.questions
          .map((q) => ({
            title: q.title,
            description: '',
            explanation: q.explanation ?? null,
            explanationImageUrl: null,
            imageUrl: null,
            answers: q.answers.map((a) => ({
              title: a.title,
              description: '',
              isCorrect: a.isCorrect,
              imageUrl: null,
            })),
          }))
          .map((q, i) => ({
            ...q,
            imageUrl: imageUrls.questionUrls.at(i)?.question ?? null,
            explanationImageUrl:
              imageUrls.questionUrls.at(i)?.explanation ?? null,
          })),
      });

      toastStore.addToast('Quiz created!', 'success');
      queryClient.invalidateQueries({ queryKey: ['getQuizzesInfinite'] });
      router.push('/');
      resetQuizLocalStorage();
      setOverviewFormData(defaultOverviewFormData);
      setQuestionsFormData(defaultQuestionsFormData);
    } catch (error) {
      toastStore.addToast('Could not create quiz!', 'error');
      console.error('Failed to create quiz', error);
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
              isPending={isPending}
              isDisabled={isPending || isSuccess}
              editMode={false}
            />
          )}
        </Grid>
      </Grid>
    </Box>
  );
}
