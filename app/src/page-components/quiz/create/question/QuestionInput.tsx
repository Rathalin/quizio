import {
  Box,
  Button,
  Card,
  CardContent,
  Divider,
  TextField,
} from '@mui/material';
import AnswerInput from './answer/AnswerInput';
import { Add as AddIcon } from '@mui/icons-material';
import DeleteQuestionButton from './DeleteQuestionButton';
import { useFieldArray, useFormContext } from 'react-hook-form';
import { QuestionIndexContext, useQuestionIndex } from './QuestionIndexContext';
import { AnswerIndexContext } from './answer/AnswerIndexContext';

type QuestionInputProps = {
  deletable: boolean;
  onDelete: () => void;
};
const minAnswers = 2;

export default function QuestionInput({
  deletable,
  onDelete,
}: QuestionInputProps) {
  const index = useQuestionIndex();
  const { control, register } = useFormContext();
  const name = `questions.${index}.answers`;
  const { fields, append, remove } = useFieldArray({
    name: name as 'questions.0.answers',
    control,
  });

  return (
    <QuestionIndexContext.Provider value={index}>
      <Card elevation={4}>
        <CardContent>
          <Box>
            <Box
              sx={{
                marginBottom: 4,
                gap: 2,
                display: 'flex',
                alignItems: 'center',
              }}
            >
              <TextField
                id={name}
                label={`Question`}
                fullWidth
                required
                {...register(name)}
              />
              <DeleteQuestionButton disabled={!deletable} onDelete={onDelete} />
            </Box>
            <Box>
              <Box
                sx={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 2,
                  marginBottom: 2,
                }}
              >
                {fields.map((field, index) => (
                  <AnswerIndexContext.Provider key={field.id} value={index}>
                    <AnswerInput
                      onDelete={() => remove(index)}
                      minAnswers={minAnswers}
                      isCorrect={false}
                      deletable={fields.length > minAnswers}
                    />
                  </AnswerIndexContext.Provider>
                ))}
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                <Button
                  variant="outlined"
                  startIcon={<AddIcon />}
                  onClick={() => append({ title: '', isCorrect: false })}
                >
                  Answer
                </Button>
              </Box>
            </Box>
            <Divider sx={{ marginBlock: 4 }} />
          </Box>
        </CardContent>
      </Card>
    </QuestionIndexContext.Provider>
  );
}
