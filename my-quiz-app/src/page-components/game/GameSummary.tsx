import {
  Typography,
  Box,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  ListItemButton,
  useTheme,
} from '@mui/material';
import { Check as CheckIcon } from '@mui/icons-material';
import GradientWord from '@/components/GradientWord';
import { AnsweredState } from '@/pages/play/[id].page';

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
  answeredProgress: AnsweredState[];
};

export default function GameSummary({
  questions,
  answeredProgress,
}: GameSummaryProps) {
  const theme = useTheme();
  return (
    <>
      <Typography variant="h1">
        <GradientWord>Summary</GradientWord>
      </Typography>
      <Typography>
        {`You got ${
          answeredProgress.filter(
            (score) => score.correctAnswerId === score.selectedAnswerId
          ).length
        } out of ${questions.length} answers correct!`}
      </Typography>
      <Box sx={{ marginTop: 4 }}>
        {questions.map((question, qIndex) => (
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
                  <ListItemButton
                    selected={
                      answer.id === answeredProgress[qIndex].selectedAnswerId
                    }
                    disableRipple
                    sx={{
                      cursor: 'default',
                      '&:hover': { backgroundColor: 'transparent' },
                    }}
                  >
                    <ListItemIcon>
                      {answer.correct ? <CheckIcon color="success" /> : null}
                    </ListItemIcon>
                    <ListItemText>
                      <Typography>{answer.title}</Typography>
                    </ListItemText>
                  </ListItemButton>
                </ListItem>
              ))}
            </List>
          </Box>
        ))}
      </Box>
    </>
  );
}
