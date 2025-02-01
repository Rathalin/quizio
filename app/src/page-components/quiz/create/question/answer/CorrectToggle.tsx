import { Controller, useFormContext } from 'react-hook-form';
import { useQuestionIndex } from '../QuestionIndexContext';
import { useAnswerIndex } from './AnswerIndexContext';
import { useIsMobile } from '@/custom-hooks/useIsMobile';
import CheckIcon from '@mui/icons-material/Check';
import ClearIcon from '@mui/icons-material/Clear';
import Tooltip from '@mui/material/Tooltip';
import Box from '@mui/material/Box';
import Checkbox from '@mui/material/Checkbox';
import { useTranslations } from 'next-intl';

type Props = {
  onToggle: () => void;
};

export default function CorrectToggle({ onToggle }: Props) {
  const t = useTranslations('quizForm.form.question.answer');
  const isMobile = useIsMobile();
  const { control, watch, setValue } = useFormContext();
  const questionIndex = useQuestionIndex();
  const answerIndex = useAnswerIndex();

  const name = `questions.${questionIndex}.answers.${answerIndex}.isCorrect` as const;

  const tooltipTitle = (watch(name) as boolean) ? t.rich('correct') : t('incorrect');

  return (
    <Tooltip title={tooltipTitle} enterDelay={500} enterNextDelay={500} arrow>
      <Box>
        <Controller
          name={name}
          render={({ field }) => (
            <Checkbox
              size={isMobile ? 'small' : 'medium'}
              icon={<ClearIcon color="primary" />}
              checkedIcon={<CheckIcon color="success" />}
              {...field}
              onChange={(_e, checked) => {
                setValue(name, checked);
                onToggle();
              }}
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
