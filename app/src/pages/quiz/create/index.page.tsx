import GradientText from '@/components/GradientText';
import OverviewForm from '@/page-components/quiz/create/OverviewForm';
import SummaryForm from '@/page-components/quiz/create/SummaryForm';
import { useState } from 'react';

import { QueryClient, useQueryClient } from '@tanstack/react-query';
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
import { GetServerSideProps } from 'next';
import { getMessages } from '@/utilities/getMessages';
import { useTranslations } from 'next-intl';
import { steps, useQuizFormSteps } from '../useQuizFormSteps';
import Head from 'next/head';
import { quizioTitle } from '@/utilities/quizioTitle';
import { raise } from '@/utilities/errorHandling';
import { throwOnError } from '@/api-client';
import { fetchAllowedFileTypes } from '@/data/useAllowedFileTypesQuery';

export const getServerSideProps: GetServerSideProps = async (ctx) => {
  const messagesPromise = getMessages(ctx.locale, ['quizForm']);

  const queryClient = new QueryClient();
  const prefetchAllowedFileTypesPromise = queryClient.prefetchQuery({
    queryKey: ['getAllowedFileTypes'],
    queryFn: () => throwOnError(() => fetchAllowedFileTypes()),
  });

  const [messages] = await Promise.all([messagesPromise, prefetchAllowedFileTypesPromise]);

  return {
    props: {
      messages,
    },
  };
};

export default function QuizCreatePage() {
  const t = useTranslations('quizForm');
  const router = useRouter();
  const queryClient = useQueryClient();
  const { showSuccessToast, showErrorToast } = useToastStore();
  const [activeStep, setActiveStep] = useState(0);
  const [overviewFormData, setOverviewFormData] = useState<QuizOverviewForm>(defaultOverviewFormData);
  const [questionsFormData, setQuestionsFormData] = useState<QuizQuestionsForm>(defaultQuestionsFormData);
  const { backLabel, nextLabel } = useQuizFormSteps(activeStep);

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

  async function handleCreateQuizClick(publish: boolean) {
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
      isPublished: publish,
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

      showSuccessToast(t('form.status.create.success'));
      queryClient.invalidateQueries({ queryKey: ['getMyQuizzes'] });
      queryClient.invalidateQueries({ queryKey: ['getQuizzesInfinite'] });
      await router.push('/my-quizzes');
      resetQuizLocalStorage();
      setOverviewFormData(defaultOverviewFormData);
      setQuestionsFormData(defaultQuestionsFormData);
    } catch (error) {
      showErrorToast(t('form.status.create.error'));
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

  return (
    <>
      <Head>
        <title>{quizioTitle(t('create.meta.title'))}</title>
      </Head>
      <Box>
        <QuizioBreadcrumbs>
          <Link href="/my-quizzes" aria-current="page">
            {t('breadcrumbs.myQuizzes')}
          </Link>
          <Link href="/quiz/create" aria-current="page">
            {t('breadcrumbs.create.current')}
          </Link>
        </QuizioBreadcrumbs>
        <Typography variant="h3" component="h1" sx={{ marginTop: 2, marginBottom: 4 }}>
          {t.rich('heading.create', {
            gradient: (chunks) => <GradientText>{chunks}</GradientText>,
          })}
        </Typography>
        <Grid container spacing={4}>
          <Grid item xs={12} md={3} sx={{ display: { xs: 'none', md: 'block' } }}>
            <Card>
              <CardContent>
                <Stepper orientation="vertical" activeStep={activeStep}>
                  {steps.map((step) => (
                    <Step key={step.title}>
                      <StepLabel>{t(`form.steps.${step.title}`)}</StepLabel>
                    </Step>
                  ))}
                </Stepper>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={9}>
            {steps[activeStep].title === 'details' && (
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
            {steps[activeStep].title === 'questions' && (
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
            {steps[activeStep].title === 'review' && (
              <SummaryForm
                overviewFormData={overviewFormData}
                questionsFormData={questionsFormData}
                backLabel={backLabel}
                onBack={() => handleBack()}
                onCreate={(publish) => handleCreateQuizClick(publish)}
                onUpdate={() => raise('onUpdate should not be called inside create quiz page.')}
                isPending={isPending}
                isDisabled={isPending || isSuccess}
                editMode={false}
              />
            )}
          </Grid>
        </Grid>
      </Box>
    </>
  );
}
