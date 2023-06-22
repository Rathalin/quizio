import { Box, Button, Tooltip } from '@mui/material';
import QuestionInput from './question/QuestionInput';
import { Add as AddIcon } from '@mui/icons-material';
import { useFieldArray, useFormContext } from 'react-hook-form';
import { QuestionIndexContext } from './question/QuestionIndexContext';
import { defaultQuestionFormData } from '@/pages/quiz/create/index.page';

const minQuestions = 1;
const maxQuestions = 20;

export default function QuestionsForm() {
  const { control } = useFormContext();
  const { fields, append, remove } = useFieldArray({
    name: 'questions',
    control,
  });

  return (
    <>
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
        {fields.map((field, index) => (
          <QuestionIndexContext.Provider key={field.id} value={index}>
            <QuestionInput
              onDelete={() => remove(index)}
              deletable={fields.length > minQuestions}
            />
          </QuestionIndexContext.Provider>
        ))}
      </Box>
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          marginTop: 4,
        }}
      >
        <Tooltip
          title={
            fields.length >= maxQuestions
              ? `You can only add ${maxQuestions} questions.`
              : null
          }
          arrow
        >
          <Box>
            <Button
              startIcon={<AddIcon />}
              variant="outlined"
              onClick={() => append(defaultQuestionFormData)}
              disabled={fields.length >= maxQuestions}
            >
              Question
            </Button>
          </Box>
        </Tooltip>
      </Box>
    </>
  );
}
