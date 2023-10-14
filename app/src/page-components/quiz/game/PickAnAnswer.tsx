import {
  Typography,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  ListItemIcon,
  Stack,
  Grid,
} from '@mui/material';
import AnsweredProgress from './AnsweredProgress';
import { AnsweredState } from '@/pages/play/[id].page';
import IndexAvatar from './IndexAvatar';
import CheckIcon from '@mui/icons-material/Check';
import ClearIcon from '@mui/icons-material/Clear';

type PickAnAnswerProps = {
  index: number;
  title: string;
  answers: { id: string; title: string; correct: boolean }[];
  answeredProgress: AnsweredState[];
  onAnswer: (selectedAnswerId: string) => void;
  selectedAnswerId: string | null;
};

export default function PickAnAnswer({
  index,
  title,
  answers,
  answeredProgress,
  onAnswer,
  selectedAnswerId,
}: PickAnAnswerProps) {
  const answered = selectedAnswerId != null;

  return (
    <>
      <Grid
        container
        spacing={4}
        wrap="wrap-reverse"
        sx={{ paddingTop: 6, paddingInline: 6, paddingBottom: 2 }}
      >
        <Grid item xs={12} md={8}>
          <Stack direction="row" alignItems="center" gap={2}>
            <IndexAvatar index={index} />
            <Typography variant="h4" component="h1" sx={{ margin: 0 }}>
              {title}
            </Typography>
          </Stack>
        </Grid>
        <Grid item xs={12} md={4}>
          <Stack direction="row" justifyContent="end">
            <AnsweredProgress answeredProgress={answeredProgress} />
          </Stack>
        </Grid>
      </Grid>
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
