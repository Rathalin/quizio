import {
  Typography,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  ListItemIcon,
  useTheme,
  Avatar,
  Stack,
  Grid,
} from '@mui/material';
import AnsweredProgress from './AnsweredProgress';
import { AnsweredState } from '@/pages/play/[id].page';
import { Check as CheckIcon, Clear as ClearIcon } from '@mui/icons-material';

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
  const theme = useTheme();
  const answered = selectedAnswerId != null;

  return (
    <>
      <Grid
        container
        spacing={4}
        sx={{ paddingTop: 6, paddingInline: 6, paddingBottom: 2 }}
        wrap="wrap-reverse"
      >
        <Grid item xs={12} md={8}>
          <Stack direction="row" alignItems="center" gap={2}>
            <Stack direction="row" alignItems="center" gap={2}>
              <Avatar
                sx={{
                  backgroundColor: theme.palette.secondary.main,
                  fontWeight: 700,
                  width: '2rem',
                  height: '2rem',
                }}
              >
                {index}
              </Avatar>
              <Typography variant="h4" component="h1" sx={{ margin: 0 }}>
                {title}
              </Typography>
            </Stack>
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
