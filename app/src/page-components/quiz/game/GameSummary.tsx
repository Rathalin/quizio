import GradientWord from '@/components/GradientWord';
import { AnsweredState } from '@/pages/play/[uuid].page';
import { useColorMode } from '@/page-components/theme.context';
import CheckIcon from '@mui/icons-material/Check';
import { darken, lighten, useTheme } from '@mui/material/styles';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Divider from '@mui/material/Divider';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';

type GameSummaryProps = {
  questions: {
    id: string;
    title: string;
    explanation: string | null;
    answers: {
      id: string;
      title: string;
      correct: boolean;
    }[];
  }[];
  answeredProgress: AnsweredState[];
};

export default function GameSummary({ questions, answeredProgress }: GameSummaryProps) {
  const theme = useTheme();
  const { mode } = useColorMode();
  return (
    <>
      <Typography variant="h1">
        <GradientWord>Summary</GradientWord>
      </Typography>
      <Typography>
        {`You got ${
          answeredProgress.filter((score) => score.correctAnswerId === score.selectedAnswerId).length
        } out of ${questions.length} answers correct!`}
      </Typography>
      <Box sx={{ marginTop: 4 }}>
        {questions.map((question, qIndex) => (
          <Box key={question.id}>
            {qIndex > 0 && <Divider />}
            <Typography variant="h5" component="h2" sx={{ marginTop: 2, marginBottom: 0 }}>
              {question.title}
            </Typography>
            <List dense>
              {question.answers.map((answer) => (
                <ListItem key={answer.id} disableGutters>
                  <ListItemButton
                    selected={answer.id === answeredProgress[qIndex].selectedAnswerId}
                    disableRipple
                    sx={{
                      cursor: 'default',
                      '&:hover': { backgroundColor: 'transparent' },
                      '&.Mui-selected, &.Mui-selected:hover': {
                        backgroundColor: answer.correct
                          ? mode === 'light'
                            ? lighten(theme.palette.success.main, 0.6)
                            : darken(theme.palette.success.main, 0.6)
                          : mode === 'light'
                            ? lighten(theme.palette.error.main, 0.6)
                            : darken(theme.palette.error.main, 0.6),
                      },
                    }}
                  >
                    <ListItemIcon>{answer.correct ? <CheckIcon color="success" /> : null}</ListItemIcon>
                    <ListItemText>
                      <Typography>{answer.title}</Typography>
                    </ListItemText>
                  </ListItemButton>
                </ListItem>
              ))}
            </List>
            {question.explanation != null && question.explanation.length > 0 && (
              <Box sx={{ marginBottom: 2 }}>
                <Typography component="span" color={theme.palette.primary.main}>
                  Explanation:
                </Typography>
                <Typography component="span" sx={{ marginLeft: 1 }}>
                  {question.explanation}
                </Typography>
              </Box>
            )}
          </Box>
        ))}
      </Box>
    </>
  );
}
