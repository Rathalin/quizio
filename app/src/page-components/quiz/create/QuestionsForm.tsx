import QuestionInput from './question/QuestionInput';
import { FormProvider, useFieldArray, useForm } from 'react-hook-form';
import { QuestionIndexContext } from './question/QuestionIndexContext';
import { defaultQuestionFormData } from '../quiz-form-data';
import { useCallback, useEffect, useState } from 'react';
import { minQuestions, maxQuestions, QuizQuestionsForm, quizQuestionsFormSchema } from '../quiz-form-schema';
import { zodResolver } from '@hookform/resolvers/zod';
import BackButton from './BackButton';
import NextButton from './NextButton';
import { storageKeys } from '@/persistence/storage-keys';
import { DevTool } from '@hookform/devtools';
import { isBrowser } from '@/utilities/isBrowser';
import { FormErrorIcon } from '../FormErrorIcon';
import AddIcon from '@mui/icons-material/Add';
import { raise } from '@/utilities/errorHandling';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Box from '@mui/material/Box';
import Tooltip from '@mui/material/Tooltip';
import Button from '@mui/material/Button';
import CardActions from '@mui/material/CardActions';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

type QuestionsFormProps = {
  defaultData: QuizQuestionsForm;
  onBack: (data: QuizQuestionsForm) => void;
  onSubmit: (data: QuizQuestionsForm) => void;
  backLabel: string | null;
  nextLabel: string | null;
  editMode: boolean;
};

export default function QuestionsForm({
  defaultData,
  onSubmit,
  onBack,
  backLabel,
  nextLabel,
  editMode,
}: QuestionsFormProps) {
  const [expanded, setExpanded] = useState<string | null>(null);
  const methods = useForm({
    defaultValues: defaultData,
    resolver: zodResolver(quizQuestionsFormSchema),
  });
  const {
    control,
    handleSubmit,
    getValues,
    reset,
    watch,
    formState: { isValid },
  } = methods;
  const { fields, append, remove } = useFieldArray({
    name: 'questions',
    control,
  });

  const getStorageItem = useCallback((): QuizQuestionsForm | null => {
    if (!isBrowser()) return null;
    try {
      return JSON.parse(localStorage.getItem(storageKeys.quizQuestionsDraft) ?? '') as QuizQuestionsForm | null;
    } catch (error) {
      return null;
    }
  }, []);

  const setStorageItem = useCallback((value: QuizQuestionsForm) => {
    if (isBrowser()) {
      localStorage.setItem(storageKeys.quizQuestionsDraft, JSON.stringify(value));
    }
  }, []);

  useEffect(() => {
    if (editMode) return;
    // Keep image from form data
    const questions = getValues('questions');
    const storageData = getStorageItem();
    if (storageData != null) {
      for (let questionIndex = 0; questionIndex < questions.length; questionIndex++) {
        const storageQuestion =
          storageData.questions.at(questionIndex) ?? raise(`No question at index ${questionIndex} in storage data`);
        const questionImage = questions.at(questionIndex)?.questionImage;
        if (questionImage != null && storageQuestion.questionImage != null) {
          storageQuestion.questionImage = questionImage;
        }
        const explanationImage = questions.at(questionIndex)?.explanationImage;
        if (explanationImage != null && storageQuestion.explanationImage != null) {
          storageQuestion.explanationImage = explanationImage;
        }
      }
    }
    reset(storageData as QuizQuestionsForm);
  }, [editMode, getStorageItem, getValues, reset]);

  useEffect(() => {
    if (editMode) return;
    const subscription = watch((value) => {
      const valueToStore = structuredClone(value);
      // Don't store question and explanation images
      for (const question of valueToStore.questions ?? []) {
        if (question?.questionImage?.data?.file != null) {
          question.questionImage.data.file = null;
        }
        if (question?.explanationImage?.data?.file != null) {
          question.explanationImage.data.file = null;
        }
      }
      setStorageItem(valueToStore as QuizQuestionsForm);
    });
    return () => subscription.unsubscribe();
  }, [watch, setStorageItem, editMode, getValues]);

  useEffect(() => {
    if (!editMode) return;
    reset(defaultData);
  }, [defaultData, editMode, reset]);

  function handleFormSubmit(data: QuizQuestionsForm) {
    onSubmit(data);
  }

  return (
    <FormProvider {...methods}>
      <form onSubmit={handleSubmit(handleFormSubmit)} noValidate>
        <Card>
          <CardContent>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
              {fields.map((field, index) => (
                <QuestionIndexContext.Provider key={field.uuid} value={index}>
                  <QuestionInput
                    onDelete={() => remove(index)}
                    deletable={fields.length > minQuestions}
                    expanded={expanded === field.uuid}
                    onExpand={() =>
                      setExpanded(
                        expanded === field.uuid ? null : (field.uuid ?? raise('Cannot expand question without uuid')),
                      )
                    }
                  />
                </QuestionIndexContext.Provider>
              ))}
            </Box>
            <Box
              sx={{
                display: 'flex',
                justifyContent: 'center',
                marginTop: 4,
              }}
            >
              <Tooltip
                title={fields.length >= maxQuestions ? `You can only add ${maxQuestions} questions.` : null}
                arrow
              >
                <Box>
                  <Button
                    startIcon={<AddIcon />}
                    variant="outlined"
                    onClick={() => append(defaultQuestionFormData)}
                    disabled={fields.length >= maxQuestions}
                  >
                    Question
                  </Button>
                </Box>
              </Tooltip>
            </Box>
          </CardContent>
          <CardActions sx={{ padding: 2 }}>
            <Stack gap={2} sx={{ flex: 1 }}>
              {!isValid && (
                <Stack direction="row" alignItems="center" justifyContent="end" gap={1}>
                  <FormErrorIcon />
                  <Typography color="error">This form still contains errors!</Typography>
                </Stack>
              )}
              <Stack direction="row" justifyContent="space-between" flexWrap="wrap">
                <BackButton onClick={() => onBack(getValues())}>{backLabel}</BackButton>
                <NextButton>{nextLabel}</NextButton>
              </Stack>
            </Stack>
          </CardActions>
        </Card>
      </form>
      <DevTool control={control} />
    </FormProvider>
  );
}
