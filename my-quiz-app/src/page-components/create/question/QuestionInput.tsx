import {
  Box,
  Button,
  Divider,
  FormControl,
  FormControlLabel,
  FormLabel,
  IconButton,
  Radio,
  RadioGroup,
  TextField,
  Typography,
} from '@mui/material';
import { useState } from 'react';
import AnswerInput from './answer/AnswerInput';
import { AddOutlined } from '@mui/icons-material';

export default function QuestionInput() {
  const [question, setQuestion] = useState<string>('');
  // const [isMultipleChoice, setIsMultipleChoice] = useState(false);
  const [answers, setAnswers] = useState<string[]>(['', '']);

  function addAnswer() {
    setAnswers([...answers, '']);
  }

  function deleteAnswer(index: number) {
    const newAnswers = [...answers];
    newAnswers.splice(index, 1);
    setAnswers(newAnswers);
  }

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
      {/* <Box sx={{ marginBottom: 4 }}>
        <FormControl>
          <FormLabel id="multiple-choice">
            Are multiple answers correct?
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
      </Box> */}
      <Box>
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
              key={index}
              index={index + 1}
              answer={answer}
              onAnswerChange={(newText) => {
                const newAnswers = [...answers];
                newAnswers[index] = newText;
                setAnswers(newAnswers);
              }}
              onDelete={() => deleteAnswer(index)}
              minAnswers={minAnswers}
            />
          ))}
        </Box>
        <Box sx={{ display: 'flex', justifyContent: 'center' }}>
          <Button
            variant="outlined"
            startIcon={<AddOutlined />}
            onClick={() => addAnswer()}
          >
            Answer
          </Button>
        </Box>
      </Box>
      <Divider sx={{ marginBlock: 4 }} />
      <Box sx={{ display: 'flex', justifyContent: 'center', marginTop: 2 }}>
        <Button startIcon={<AddOutlined />} variant="outlined">
          Another Question
        </Button>
      </Box>
    </Box>
  );
}
