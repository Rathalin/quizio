import { Box, Checkbox, Tooltip } from '@mui/material';
import { Controller, useFormContext } from 'react-hook-form';
import { useQuestionIndex } from '../QuestionIndexContext';
import { useAnswerIndex } from './AnswerIndexContext';
import { useIsMobile } from '@/custom-hooks/useIsMobile';
import CheckIcon from '@mui/icons-material/Check';
import ClearIcon from '@mui/icons-material/Clear';

export default function CorrectToggle() {
  const isMobile = useIsMobile();
  const { control, watch } = useFormContext();
  const questionIndex = useQuestionIndex();
  const answerIndex = useAnswerIndex();

  const name =
    `questions.${questionIndex}.answers.${answerIndex}.isCorrect` as const;

  const tooltipTitle = (watch(name) as boolean)
    ? 'This answer is marked as correct'
    : 'This answer is marked as incorrect';

  return (
    <Tooltip title={tooltipTitle} arrow>
      <Box>
        <Controller
          name={name}
          render={({ field }) => (
            <Checkbox
              size={isMobile ? 'small' : 'medium'}
              icon={<ClearIcon color="primary" />}
              checkedIcon={<CheckIcon color="success" />}
              {...field}
              checked={field.value}
              value={name}
            />
          )}
          control={control}
        />
      </Box>
    </Tooltip>
  );
}
