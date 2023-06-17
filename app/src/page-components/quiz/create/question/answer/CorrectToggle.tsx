import { Check as CheckIcon, Clear as ClearIcon } from '@mui/icons-material';
import { Checkbox, Tooltip } from '@mui/material';
import { useFormContext } from 'react-hook-form';
import { useQuestionIndex } from '../QuestionIndexContext';
import { useAnswerIndex } from './AnswerIndexContext';

export default function CorrectToggle() {
  const { register, watch } = useFormContext();
  const questionIndex = useQuestionIndex();
  const answerIndex = useAnswerIndex();

  const name = `questions.${questionIndex}.answers.${answerIndex}.isCorrect`;

  const tooltipTitle = (watch(name) as boolean)
    ? 'Marked as correct'
    : 'Marked as incorrect';

  return (
    <Tooltip title={tooltipTitle} arrow>
      <Checkbox
        icon={<ClearIcon color="primary" />}
        checkedIcon={<CheckIcon color="success" />}
        {...register(name)}
      />
    </Tooltip>
  );
}
