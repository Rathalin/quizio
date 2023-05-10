import {
  Typography,
  Box,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
} from '@mui/material';
import { Check as CheckIcon } from '@mui/icons-material';
import { Score } from '@/pages/play/[id].page';
import GradientWord from '@/components/GradientWord';

type GameSummaryProps = {
  questions: {
    id: string;
    title: string;
    answers: {
      id: string;
      title: string;
      correct: boolean;
    }[];
  }[];
  scoreProgress: Score[];
};

export default function GameSummary({
  questions,
  scoreProgress,
}: GameSummaryProps) {
  return (
    <>
      <Typography variant="h1">
        <GradientWord>Summary</GradientWord>
      </Typography>
      <Typography>
        {`You got ${
          scoreProgress.filter((score) => score === 'correct').length
        } out of ${questions.length} answers correct!`}
      </Typography>
      <Box sx={{ marginTop: 4 }}>
        {questions.map((question) => (
          <Box key={question.id}>
            <Typography
              variant="h5"
              component="h2"
              sx={{ marginTop: 2, marginBottom: 0 }}
            >
              {question.title}
            </Typography>
            <List dense>
              {question.answers.map((answer) => (
                <ListItem key={answer.id}>
                  <ListItemIcon>
                    {answer.correct ? <CheckIcon color="success" /> : null}
                  </ListItemIcon>
                  <ListItemText>
                    <Typography>{answer.title}</Typography>
                  </ListItemText>
                </ListItem>
              ))}
            </List>
          </Box>
        ))}
      </Box>
    </>
  );
}
