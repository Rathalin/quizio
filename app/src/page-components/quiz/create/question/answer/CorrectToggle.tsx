import { Check as CheckIcon, Clear as ClearIcon } from '@mui/icons-material';
import { Checkbox, Tooltip } from '@mui/material';
import { Controller, useFormContext } from 'react-hook-form';
import { useQuestionIndex } from '../QuestionIndexContext';
import { useAnswerIndex } from './AnswerIndexContext';

export default function CorrectToggle() {
  const { control, watch } = useFormContext();
  const questionIndex = useQuestionIndex();
  const answerIndex = useAnswerIndex();

  const name = `questions.${questionIndex}.answers.${answerIndex}.isCorrect`;

  const tooltipTitle = (watch(name) as boolean)
    ? 'Marked as correct'
    : 'Marked as incorrect';

  return (
    <Tooltip title={tooltipTitle} arrow>
      <Controller
        name={name}
        render={({ field }) => (
          <Checkbox
            icon={<ClearIcon color="primary" />}
            checkedIcon={<CheckIcon color="success" />}
            {...field}
            checked={field.value}
            value={name}
          />
        )}
        control={control}
      />
    </Tooltip>
  );
}
