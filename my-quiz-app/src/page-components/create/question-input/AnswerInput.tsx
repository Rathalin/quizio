import { DeleteOutlined } from '@mui/icons-material';
import {
  Box,
  Button,
  Checkbox,
  FormControlLabel,
  FormGroup,
  IconButton,
  Radio,
  TextField,
} from '@mui/material';
import CorrectToggle from './CorrectToggle';
import { useState } from 'react';

type AnswerInputProps = {
  index: number;
  minAnswers: number;
  isMultipleChoice: boolean;
};

export default function AnswerInput({
  index,
  minAnswers,
  isMultipleChoice,
}: AnswerInputProps) {
  const [isCorrect, setIsCorrect] = useState(false);

  return (
    <form>
      <Box
        sx={{ display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}
      >
        <TextField
          id={`answer-${index}`}
          name={`answer-${index}`}
          label={`Answer ${index}`}
          color={isCorrect ? 'success' : 'error'}
          sx={{ flex: 1 }}
        />
        <CorrectToggle isCorrect={isCorrect} onChange={setIsCorrect} />
        <IconButton
          color="error"
          sx={{ visibility: index <= minAnswers ? 'hidden' : 'visible' }}
        >
          <DeleteOutlined />
        </IconButton>
      </Box>
    </form>
  );
}
