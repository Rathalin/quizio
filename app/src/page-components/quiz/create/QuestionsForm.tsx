import { Box, Button, Tooltip } from '@mui/material';
import QuestionInput from './question/QuestionInput';
import { Add as AddIcon } from '@mui/icons-material';
import { useFieldArray, useFormContext } from 'react-hook-form';
import { QuestionIndexContext } from './question/QuestionIndexContext';
import { defaultQuestionFormData } from './quiz-form-data';
import { useState } from 'react';

const minQuestions = 1;
const maxQuestions = 20;

export default function QuestionsForm() {
  const [expanded, setExpanded] = useState<string | null>(null);
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
              expanded={expanded === field.id}
              onExpand={() =>
                setExpanded(expanded === field.id ? null : field.id)
              }
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
