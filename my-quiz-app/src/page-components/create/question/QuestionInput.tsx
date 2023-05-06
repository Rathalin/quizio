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
import {
  type QuestionDraft,
  useQuizDraft,
  AnswerDraft,
} from '@/stores/quiz-draft.store';
import DeleteQuestionButton from './DeleteQuestionButton';

type QuestionInputProps = {
  index: number;
  question: QuestionDraft;
  setQuestion: (question: QuestionDraft) => void;
  onDelete: () => void;
};

export default function QuestionInput({
  index,
  question,
  setQuestion,
  onDelete,
}: QuestionInputProps) {
  const minAnswers = 2;

  function setTitle(title: string) {
    setQuestion({ title, answers: question.answers });
  }

  function addAnswer(answer: AnswerDraft) {
    setQuestion({
      title: question.title,
      answers: [...question.answers, answer],
    });
  }

  function setAnswer(answer: AnswerDraft, index: number) {
    setQuestion({
      title: question.title,
      answers: question.answers.map((a, i) => (i === index ? answer : a)),
    });
  }

  function deleteAnswer(index: number) {
    setQuestion({
      title: question.title,
      answers: question.answers.filter((_, i) => i !== index),
    });
  }

  return (
    <Card>
      <CardContent>
        <Box key={`question-${index}`}>
          <Box
            sx={{
              marginBottom: 4,
              gap: 2,
              display: 'flex',
              alignItems: 'center',
            }}
          >
            <TextField
              id={`question-title-${index}`}
              name={`question-title-${index}`}
              label={`Question`}
              value={question.title}
              onChange={(e) => setTitle(e.target.value)}
              fullWidth
              required
            />
            <DeleteQuestionButton index={index} onDelete={onDelete} />
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
              {question.answers.map((answer, aIndex) => (
                <AnswerInput
                  key={aIndex}
                  index={aIndex + 1}
                  text={answer.text}
                  onTextChange={(text) =>
                    setAnswer({ text, isCorrect: answer.isCorrect }, aIndex)
                  }
                  isCorrect={answer.isCorrect}
                  onIsCorrectChange={(isCorrect) =>
                    setAnswer({ text: answer.text, isCorrect }, aIndex)
                  }
                  onDelete={() => deleteAnswer(aIndex)}
                  minAnswers={minAnswers}
                />
              ))}
            </Box>
            <Box sx={{ display: 'flex', justifyContent: 'center' }}>
              <Button
                variant="outlined"
                startIcon={<AddIcon />}
                onClick={() => addAnswer({ text: '', isCorrect: false })}
              >
                Answer
              </Button>
            </Box>
          </Box>
          <Divider sx={{ marginBlock: 4 }} />
        </Box>
      </CardContent>
    </Card>
  );
}
