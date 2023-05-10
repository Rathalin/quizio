import {
  Typography,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
} from '@mui/material';
import ScoreProgress from './ScoreProgress';
import { Score } from '@/pages/play/[id].page';

type PickAnAnswerProps = {
  title: string;
  answers: { id: string; title: string; correct: boolean }[];
  scoreProgress: Score[];
  onAnswer: (correct: boolean) => void;
};

export default function PickAnAnswer({
  title,
  answers,
  scoreProgress,
  onAnswer,
}: PickAnAnswerProps) {
  return (
    <>
      {' '}
      <Typography
        variant="h4"
        component="h1"
        sx={{
          margin: 4,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <Typography variant="inherit" component="span">
          {title}
        </Typography>
        <ScoreProgress progress={scoreProgress} />
      </Typography>
      <List disablePadding>
        {answers.map((answer) => (
          <ListItem key={answer.id} disableGutters>
            <ListItemButton
              sx={{ fontSize: '1.2rem', paddingInline: 6 }}
              onClick={() => onAnswer(answer.correct)}
            >
              <ListItemText>{answer.title}</ListItemText>
            </ListItemButton>
          </ListItem>
        ))}
      </List>
    </>
  );
}
