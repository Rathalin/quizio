import {
  Typography,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  ListItemIcon,
  useTheme,
} from '@mui/material';
import AnsweredProgress from './AnsweredProgress';
import { AnsweredState } from '@/pages/play/[id].page';
import { Check as CheckIcon, Clear as ClearIcon } from '@mui/icons-material';

type PickAnAnswerProps = {
  title: string;
  answers: { id: string; title: string; correct: boolean }[];
  answeredProgress: AnsweredState[];
  onAnswer: (selectedAnswerId: string) => void;
  selectedAnswerId: string | null;
};

export default function PickAnAnswer({
  title,
  answers,
  answeredProgress,
  onAnswer,
  selectedAnswerId,
}: PickAnAnswerProps) {
  const theme = useTheme();
  const answered = selectedAnswerId != null;

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
          flexWrap: 'wrap-reverse',
          gap: 2,
        }}
      >
        <Typography variant="inherit" component="span">
          {title}
        </Typography>
        <AnsweredProgress answeredProgress={answeredProgress} />
      </Typography>
      <List disablePadding>
        {answers.map((answer) => (
          <ListItem key={answer.id} disableGutters>
            <ListItemButton
              sx={{
                fontSize: '1.2rem',
                paddingInline: 6,
                '&.Mui-disabled': {
                  opacity: 1,
                },
              }}
              color="secondary.main"
              onClick={() => {
                if (answered) return;
                onAnswer(answer.id);
              }}
              selected={selectedAnswerId === answer.id}
              disabled={answered}
            >
              <ListItemIcon>
                {answered &&
                  (answer.correct ? (
                    <CheckIcon color="success" />
                  ) : (
                    <ClearIcon color="error" />
                  ))}
              </ListItemIcon>
              <ListItemText>{answer.title}</ListItemText>
            </ListItemButton>
          </ListItem>
        ))}
      </List>
    </>
  );
}
