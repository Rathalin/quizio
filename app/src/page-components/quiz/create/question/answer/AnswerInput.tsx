import CorrectToggle from './CorrectToggle';
import DeleteAnswerButton from './DeleteAnswerButton';
import { Controller, useFormContext } from 'react-hook-form';
import { useAnswerIndex } from './AnswerIndexContext';
import { useQuestionIndex } from '../QuestionIndexContext';
import QuizioTextField from '@/components/inputs/QuizioTextField';
import { ZodFieldErrors } from '../../../../../../types/hook-form-zod';
import { constraints, QuizQuestionsForm } from '@/page-components/quiz/quiz-form-schema';
import Stack from '@mui/material/Stack';
import { useTranslations } from 'next-intl';

type AnswerInputProps = {
  isCorrect: boolean;
  onDelete: () => void;
  minAnswers: number;
  deletable: boolean;
  hasAdditionalError: boolean;
};

export default function AnswerInput({
  isCorrect,
  onDelete,
  minAnswers,
  deletable,
  hasAdditionalError,
}: AnswerInputProps) {
  const t = useTranslations('quizForm.form.question.answer');
  const questionIndex = useQuestionIndex();
  const index = useAnswerIndex();
  const {
    control,
    formState: { errors: formErrors, isSubmitted },
    trigger,
  } = useFormContext<QuizQuestionsForm>();

  const answersName = `questions.${questionIndex}.answers` as `questions.0.answers`;
  const name = `${answersName}.${index}` as `questions.0.answers.0`;
  const errors = formErrors as ZodFieldErrors<typeof formErrors>;
  const answerErrors = errors.questions?.[questionIndex]?.answers?.[index];

  return (
    <Stack
      direction="row"
      sx={{
        columnGap: 2,
        alignItems: 'start',
        flexWrap: 'wrap-reverse',
      }}
    >
      <Controller
        name={`${name}.title`}
        render={({ field }) => (
          <QuizioTextField
            id={name}
            label={t('label', { count: index + 1 })}
            color={isCorrect ? 'success' : 'primary'}
            sx={{
              flex: 1,
              width: {
                xs: '100%',
                sm: 'auto',
              },
            }}
            error={answerErrors != null || hasAdditionalError}
            helperText={answerErrors?.title?.message?.toString() ?? ''}
            required
            slotProps={{
              htmlInput: {
                maxLength: constraints.quiz.answer.title.maxLength,
              },
            }}
            autoComplete="off"
            {...field}
          />
        )}
        rules={{ required: true }}
        control={control}
      />
      <Stack
        direction="row"
        sx={{
          gap: 2,
          alignItems: 'center',
          justifyContent: 'end',
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
        <CorrectToggle
          onToggle={() => {
            if (isSubmitted) {
              trigger(answersName);
            }
          }}
        />
        <DeleteAnswerButton minAnswers={minAnswers} onDelete={onDelete} disabled={!deletable} />
      </Stack>
    </Stack>
  );
}
