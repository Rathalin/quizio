import {
  Box,
  Button,
  Card,
  CardActions,
  CardContent,
  Tooltip,
} from '@mui/material';
import QuestionInput from './question/QuestionInput';
import { Add as AddIcon } from '@mui/icons-material';
import { FormProvider, useFieldArray, useForm } from 'react-hook-form';
import { QuestionIndexContext } from './question/QuestionIndexContext';
import { defaultQuestionFormData } from '../quiz-form-data';
import { useEffect, useState } from 'react';
import {
  minQuestions,
  maxQuestions,
  QuizQuestionsForm,
  quizQuestionsFormSchema,
} from '../quiz-form-schema';
import { zodResolver } from '@hookform/resolvers/zod';
import BackButton from './BackButton';
import NextButton from './NextButton';
import { useStorage } from '@/custom-hooks/useStorage';
import { storageKeys } from '@/persistence/storage-keys';

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
  const { control, handleSubmit, getValues, reset, watch } = methods;
  const { fields, append, remove } = useFieldArray({
    name: 'questions',
    control,
  });

  const { getStorageItem, setStorageItem } = useStorage<QuizQuestionsForm>(
    storageKeys.quizQuestionsDraft
  );
  useEffect(() => {
    if (editMode) return;
    reset(getStorageItem() as QuizQuestionsForm);
  }, [editMode, getStorageItem, reset]);

  useEffect(() => {
    if (editMode) return;
    const subscription = watch((value) => {
      setStorageItem(value as QuizQuestionsForm);
    });
    return () => subscription.unsubscribe();
  }, [watch, setStorageItem, editMode]);

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
                <QuestionIndexContext.Provider key={field.id} value={index}>
                  <QuestionInput
                    onDelete={() => remove(index)}
                    deletable={fields.length > minQuestions}
                    expanded={expanded === field.id}
                    onExpand={() =>
                      setExpanded(expanded === field.id ? null : field.id)
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
                title={
                  fields.length >= maxQuestions
                    ? `You can only add ${maxQuestions} questions.`
                    : null
                }
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
          <CardActions sx={{ padding: 2, justifyContent: 'space-between' }}>
            <BackButton onClick={() => onBack(getValues())}>
              {backLabel}
            </BackButton>
            <NextButton>{nextLabel}</NextButton>
          </CardActions>
        </Card>
      </form>
    </FormProvider>
  );
}
