import { Stack } from '@mui/material';
import CorrectToggle from './CorrectToggle';
import DeleteAnswerButton from './DeleteAnswerButton';
import { Controller, useFormContext } from 'react-hook-form';
import { useAnswerIndex } from './AnswerIndexContext';
import { useQuestionIndex } from '../QuestionIndexContext';
import QuizioTextField from '@/components/inputs/QuizioTextField';
import { constraints } from '@/content-type-utilities/content-type-constraints';
import { ZodFieldErrors } from '../../../../../../types/hook-form-zod';
import { QuizQuestionsForm } from '@/page-components/quiz/quiz-form-schema';

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
    formState: { errors: formErrors },
  } = useFormContext<QuizQuestionsForm>();

  const name =
    `questions.${questionIndex}.answers.${index}` as `questions.${number}.answers.${number}`;
  const errors = formErrors as ZodFieldErrors<typeof formErrors>;
  const answerErrors = errors.questions?.[questionIndex]?.answers?.[index];

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
            error={answerErrors != null}
            helperText={answerErrors?.title?.message?.toString() ?? ''}
            required
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
