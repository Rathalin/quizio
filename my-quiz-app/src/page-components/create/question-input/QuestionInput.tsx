import {
  Box,
  FormControl,
  FormControlLabel,
  FormLabel,
  Radio,
  RadioGroup,
  TextField,
  Typography,
} from '@mui/material';
import { useState } from 'react';
import AnswerInput from './AnswerInput';

export default function QuestionInput() {
  const [question, setQuestion] = useState<string>('');
  const [isMultipleChoice, setIsMultipleChoice] = useState(false);
  const [answers, setAnswers] = useState<string[]>(['', '']);

  const minAnswers = 2;

  return (
    <Box>
      <Box sx={{ marginBottom: 4 }}>
        <TextField
          id={`question-`}
          name={`question-`}
          label={`Question`}
          fullWidth
          required
        />
      </Box>
      <Box sx={{ marginBottom: 4 }}>
        <FormControl>
          <FormLabel id="multiple-choice">
            Are there multiple correct answers?
          </FormLabel>
          <RadioGroup
            defaultValue={isMultipleChoice ? 'yes' : 'no'}
            onChange={(e) => setIsMultipleChoice(e.target.value === 'yes')}
            name="multiple-choice"
            sx={{ flexDirection: 'row' }}
          >
            <FormControlLabel value="yes" control={<Radio />} label="Yes" />
            <FormControlLabel value="No" control={<Radio />} label="No" />
          </RadioGroup>
        </FormControl>
      </Box>
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          gap: 2,
          marginBottom: 2,
        }}
      >
        {answers.map((answer, index) => (
          <AnswerInput
            index={index + 1}
            isMultipleChoice={isMultipleChoice}
            minAnswers={minAnswers}
          />
        ))}
      </Box>
    </Box>
  );
}
