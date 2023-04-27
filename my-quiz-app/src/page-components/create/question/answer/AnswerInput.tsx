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
  Tooltip,
} from '@mui/material';
import CorrectToggle from './CorrectToggle';
import { useState } from 'react';
import DeleteAnswerButton from './DeleteAnswerButton';

type AnswerInputProps = {
  index: number;
  answer: string;
  onAnswerChange: (answer: string) => void;
  onDelete: () => void;
  minAnswers: number;
};

export default function AnswerInput({
  index,
  answer,
  onAnswerChange,
  onDelete,
  minAnswers,
}: AnswerInputProps) {
  const [isCorrect, setIsCorrect] = useState(false);

  return (
    <Box
      sx={{ display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}
    >
      <TextField
        id={`answer-${index}`}
        name={`answer-${index}`}
        label={`Answer ${index}`}
        color={isCorrect ? 'success' : 'error'}
        value={answer}
        onChange={(e) => onAnswerChange(e.target.value)}
        sx={{ flex: 1 }}
      />
      <CorrectToggle isCorrect={isCorrect} onChange={setIsCorrect} />
      <DeleteAnswerButton
        index={index}
        minAnswers={minAnswers}
        onDelete={onDelete}
      />
    </Box>
  );
}
