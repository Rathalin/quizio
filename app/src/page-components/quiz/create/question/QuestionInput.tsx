import {
  Box,
  Button,
  Card,
  CardContent,
  Divider,
  FormHelperText,
} from '@mui/material';
import AnswerInput from './answer/AnswerInput';
import { Add as AddIcon } from '@mui/icons-material';
import DeleteQuestionButton from './DeleteQuestionButton';
import {
  Controller,
  useFieldArray,
  useFormContext,
  useWatch,
} from 'react-hook-form';
import { useQuestionIndex } from './QuestionIndexContext';
import { AnswerIndexContext } from './answer/AnswerIndexContext';
import QuizioTextField from '@/components/inputs/QuizioTextField';
import { QuizCreateFormFields } from '@/pages/quiz/create/index.page';

type QuestionInputProps = {
  deletable: boolean;
  onDelete: () => void;
};
const titleMaxLength = 200;
const minAnswers = 2;
const maxAnswers = 20;

export default function QuestionInput({
  deletable,
  onDelete,
}: QuestionInputProps) {
  const index = useQuestionIndex();
  const {
    control,
    formState: { errors, isSubmitSuccessful },
    getValues,
  } = useFormContext<QuizCreateFormFields>();
  const name = `questions.${index}` as const;
  const { fields, append, remove } = useFieldArray<QuizCreateFormFields>({
    name: `${name}.answers` as 'questions.0.answers',
    control,
    rules: {
      minLength: minAnswers,
      maxLength: maxAnswers,
    },
  });

  let titleError: string | null = null;
  if (
    (errors.questions as any[] | undefined)?.at(index)?.title?.type ===
    'required'
  ) {
    titleError = 'Question is required';
  }
  let answersError: string | null = null;
  if (errors.questions?.root?.type === 'minLength') {
    answersError = `Must have at least ${minAnswers} answers`;
  } else if (errors.questions?.root?.type === 'maxLength') {
    answersError = `Must have at most ${maxAnswers} answers`;
  }

  const hasCorrectAnswer =
    useWatch({
      name: `questions.${index}`,
      control,
    }).answers.filter((answer) => answer.isCorrect).length === 1;
  let hasCorrectAnswerError: string | null = null;
  if (!hasCorrectAnswer) {
    hasCorrectAnswerError = 'Exactly one answer must be correct';
  }

  return (
    <Card elevation={4}>
      <CardContent>
        <Box>
          <Box
            sx={{
              marginBottom: 4,
              gap: 2,
              display: 'flex',
            }}
          >
            <Controller
              name={`${name}.title`}
              render={({ field }) => (
                <QuizioTextField
                  id={`${name}.title`}
                  label={`Question ${index + 1}`}
                  fullWidth
                  error={titleError != null}
                  helperText={titleError}
                  inputProps={{ maxLength: titleMaxLength }}
                  {...field}
                />
              )}
              rules={{ required: true }}
              control={control}
            />
            <Box sx={{ marginTop: 1 }}>
              <DeleteQuestionButton disabled={!deletable} onDelete={onDelete} />
            </Box>
          </Box>
          <Box>
            <Box
              sx={{
                display: 'flex',
                flexDirection: 'column',
                gap: 2,
                marginBottom: 2,
              }}
            >
              {fields.map((field, index) => (
                <AnswerIndexContext.Provider key={field.id} value={index}>
                  <AnswerInput
                    onDelete={() => remove(index)}
                    minAnswers={minAnswers}
                    isCorrect={getValues(`${name}.answers.${index}.isCorrect`)}
                    deletable={fields.length > minAnswers}
                  />
                </AnswerIndexContext.Provider>
              ))}
            </Box>
            {!isSubmitSuccessful && (
              <FormHelperText error>{hasCorrectAnswerError}</FormHelperText>
            )}
            <Box sx={{ display: 'flex', justifyContent: 'center' }}>
              <Button
                variant="outlined"
                startIcon={<AddIcon />}
                onClick={() => append({ title: '', isCorrect: false })}
              >
                Answer
              </Button>
            </Box>
          </Box>
          <Divider sx={{ marginBlock: 4 }} />
        </Box>
      </CardContent>
    </Card>
  );
}
