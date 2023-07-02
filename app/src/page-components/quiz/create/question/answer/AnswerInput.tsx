import { Stack } from '@mui/material';
import CorrectToggle from './CorrectToggle';
import DeleteAnswerButton from './DeleteAnswerButton';
import { Controller, useFormContext } from 'react-hook-form';
import { useAnswerIndex } from './AnswerIndexContext';
import { useQuestionIndex } from '../QuestionIndexContext';
import QuizioTextField from '@/components/inputs/QuizioTextField';
import { constraints } from '@/persistence/content-type-constraints';

type AnswerInputProps = {
  isCorrect: boolean;
  onDelete: () => void;
  minAnswers: number;
  deletable: boolean;
};

export default function AnswerInput({
  isCorrect,
  onDelete,
  minAnswers,
  deletable,
}: AnswerInputProps) {
  const questionIndex = useQuestionIndex();
  const index = useAnswerIndex();
  const {
    control,
    register,
    formState: { errors },
  } = useFormContext();

  const name = `questions.${questionIndex}.answers.${index}`;

  let titleError: string | null = null;
  if (
    (errors.questions as any[] | undefined)
      ?.at(questionIndex ?? 0)
      ?.answers?.at(index)?.title?.type === 'required'
  ) {
    titleError = 'Answer is required';
  }

  return (
    <Stack
      direction="row"
      columnGap={2}
      alignItems="start"
      flexWrap="wrap-reverse"
    >
      <Controller
        name={`${name}.title`}
        render={({ field }) => (
          <QuizioTextField
            id={name}
            label={`Answer ${index + 1}`}
            color={isCorrect ? 'success' : 'primary'}
            sx={{
              flex: 1,
              width: {
                xs: '100%',
                sm: 'auto',
              },
            }}
            error={titleError != null}
            helperText={titleError}
            inputProps={{ maxLength: constraints.quiz.answer.title.maxLength }}
            {...field}
          />
        )}
        rules={{ required: true }}
        control={control}
      />
      <Stack
        direction="row"
        gap={2}
        alignItems="center"
        justifyContent="end"
        sx={{
          marginTop: {
            xs: 0,
            sm: 1,
          },
          width: {
            xs: '100%',
            sm: 'auto',
          },
        }}
      >
        <CorrectToggle />
        <DeleteAnswerButton
          minAnswers={minAnswers}
          onDelete={onDelete}
          disabled={!deletable}
        />
      </Stack>
    </Stack>
  );
}
