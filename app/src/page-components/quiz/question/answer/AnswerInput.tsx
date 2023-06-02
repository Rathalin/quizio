import { Box, TextField } from '@mui/material';
import CorrectToggle from './CorrectToggle';
import DeleteAnswerButton from './DeleteAnswerButton';

type AnswerInputProps = {
  index: number;
  text: string;
  onTextChange: (text: string) => void;
  isCorrect: boolean;
  onIsCorrectChange: (isCorrect: boolean) => void;
  onDelete: () => void;
  minAnswers: number;
};

export default function AnswerInput({
  index,
  text,
  onTextChange,
  isCorrect,
  onIsCorrectChange,
  onDelete,
  minAnswers,
}: AnswerInputProps) {
  return (
    <Box
      sx={{ display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}
    >
      <TextField
        id={`answer-${index}`}
        name={`answer-${index}`}
        label={`Answer ${index}`}
        color={isCorrect ? 'success' : 'error'}
        value={text}
        onChange={(e) => onTextChange(e.target.value)}
        sx={{ flex: 1 }}
      />
      <CorrectToggle isCorrect={isCorrect} onChange={onIsCorrectChange} />
      <DeleteAnswerButton
        index={index}
        minAnswers={minAnswers}
        onDelete={onDelete}
      />
    </Box>
  );
}
