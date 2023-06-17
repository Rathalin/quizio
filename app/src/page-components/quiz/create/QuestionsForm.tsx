import { Box, Button } from '@mui/material';
import QuestionInput from './question/QuestionInput';
import { QuestionDraft } from '@/stores/quiz-draft.store';
import { Add as AddIcon } from '@mui/icons-material';
import { useFieldArray, useFormContext } from 'react-hook-form';

const emptyQuestion: QuestionDraft = {
  title: '',
  answers: [
    { title: '', isCorrect: false },
    { title: '', isCorrect: false },
  ],
};
const minQuestions = 1;

export default function QuestionsForm() {
  const { control } = useFormContext();
  const { fields, append, remove } = useFieldArray({
    name: 'questions',
    control,
  });

  return (
    <Box>
      <Box>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          {fields.map((field, index) => (
            <QuestionInput
              key={field.id}
              onDelete={() => remove(index)}
              deletable={fields.length > minQuestions}
            />
          ))}
        </Box>
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'center',
            marginTop: 2,
            marginBottom: 2,
          }}
        >
          <Button
            startIcon={<AddIcon />}
            variant="outlined"
            onClick={() => append(emptyQuestion)}
          >
            Another Question
          </Button>
        </Box>
      </Box>
    </Box>
  );
}
