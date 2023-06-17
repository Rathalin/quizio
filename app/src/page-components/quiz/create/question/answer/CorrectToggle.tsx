import { Check as CheckIcon, Clear as ClearIcon } from '@mui/icons-material';
import { Checkbox, Tooltip } from '@mui/material';
import { useFormContext } from 'react-hook-form';
import { useQuestionIndex } from '../QuestionIndexContext';
import { useAnswerIndex } from './AnswerIndexContext';

export default function CorrectToggle() {
  const { register } = useFormContext();
  const questionIndex = useQuestionIndex();
  const answerIndex = useAnswerIndex();
  // const tooltipTitle = isCorrect ? 'Marked as correct' : 'Marked as incorrect';

  return (
    <Tooltip title={'todo'} arrow>
      <Checkbox
        icon={<ClearIcon color="error" />}
        checkedIcon={<CheckIcon color="success" />}
        {...register(
          `questions.${questionIndex}.answers.${answerIndex}.isCorrect`
        )}
      />
    </Tooltip>
  );
}
