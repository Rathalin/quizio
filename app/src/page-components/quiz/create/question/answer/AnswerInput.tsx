import { Box, TextField } from '@mui/material';
import CorrectToggle from './CorrectToggle';
import DeleteAnswerButton from './DeleteAnswerButton';
import { useFormContext } from 'react-hook-form';
import { useAnswerIndex } from './AnswerIndexContext';
import { useQuestionIndex } from '../QuestionIndexContext';

type AnswerInputProps = {
  isCorrect: boolean;
  onDelete: () => void;
  minAnswers: number;
  deletable: boolean;
};

const titleMaxLength = 50;

export default function AnswerInput({
  isCorrect,
  onDelete,
  minAnswers,
  deletable,
}: AnswerInputProps) {
  const questionIndex = useQuestionIndex();
  const index = useAnswerIndex();
  const { register } = useFormContext();

  const name = `questions.${questionIndex}.answers.${index}`;

  return (
    <Box
      sx={{ display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}
    >
      <TextField
        id={name}
        label={`Answer ${index}`}
        color={isCorrect ? 'success' : 'error'}
        sx={{ flex: 1 }}
        inputProps={{ maxLength: titleMaxLength }}
        {...register(`${name}.title` as 'questions.0.answers.0.title')}
      />

      <CorrectToggle />
      <DeleteAnswerButton
        minAnswers={minAnswers}
        onDelete={onDelete}
        disabled={!deletable}
      />
    </Box>
  );
}
