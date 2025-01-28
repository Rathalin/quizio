import GradientText from '@/components/GradientText';
import OverviewForm from '@/page-components/quiz/create/OverviewForm';
import SummaryForm from '@/page-components/quiz/create/SummaryForm';
import { useState } from 'react';

import { useQueryClient } from '@tanstack/react-query';
import { QuizOverviewForm, QuizQuestionsForm } from '@/page-components/quiz/quiz-form-schema';
import QuestionsForm from '@/page-components/quiz/create/QuestionsForm';
import { defaultOverviewFormData, defaultQuestionsFormData } from '@/page-components/quiz/quiz-form-data';
import { useRouter } from 'next/router';
import { storageKeys } from '@/persistence/storage-keys';
import { useCreateQuizMutation } from '@/data/useCreateQuizMutation';
import { useToastStore } from '@/persistence/taost.store';
import { useUploadFileMutation } from '@/data/useUploadFileMutation';
import { getBase64 } from '@/data/getBase64';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Grid from '@mui/material/Grid';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Stepper from '@mui/material/Stepper';
import Step from '@mui/material/Step';
import StepLabel from '@mui/material/StepLabel';
import { QuizioBreadcrumbs } from '@/components/breadcrumbs/QuizioBreadcrumbs';
import Link from 'next/link';

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
  const { showSuccessToast, showErrorToast } = useToastStore();
  const [activeStep, setActiveStep] = useState(0);
  const [overviewFormData, setOverviewFormData] = useState<QuizOverviewForm>(defaultOverviewFormData);
  const [questionsFormData, setQuestionsFormData] = useState<QuizQuestionsForm>(defaultQuestionsFormData);

  const { mutateAsync: uploadFile } = useUploadFileMutation();
  const { mutateAsync: createQuiz, isPending, isSuccess } = useCreateQuizMutation();

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
      showErrorToast('Could not upload image!');
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

    const mutationData = {
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
          explanationImageUrl: imageUrls.questionUrls.at(i)?.explanation ?? null,
        })),
    };

    try {
      await createQuiz(mutationData);

      showSuccessToast('Quiz created!');
      queryClient.invalidateQueries({ queryKey: ['getQuizzesInfinite'] });
      await router.push('/');
      resetQuizLocalStorage();
      setOverviewFormData(defaultOverviewFormData);
      setQuestionsFormData(defaultQuestionsFormData);
    } catch (error) {
      showErrorToast('Could not create quiz!');
      console.error('Failed to create quiz', error);
    }
  }

  function handleNext() {
    setActiveStep((prevActiveStep) => Math.min(prevActiveStep + 1, steps.length - 1));
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
      <QuizioBreadcrumbs>
        <Link href="/quiz/create" aria-current="page">
          {'Create quiz'}
        </Link>
      </QuizioBreadcrumbs>
      <Typography variant="h3" component="h1">
        <GradientText>{'Create'}</GradientText>
        <span>{' your quiz'}</span>
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
