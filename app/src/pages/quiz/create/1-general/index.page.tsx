import GradientWord from '@/components/GradientWord';
import HomeButton from '@/components/buttons/HomeButton';
import { useQuizDraft } from '@/stores/quiz-draft.store';
import {
  Box,
  Card,
  CardActions,
  CardContent,
  Typography,
  useTheme,
} from '@mui/material';
import { useRouter } from 'next/router';
import { FormEvent } from 'react';
import { shallow } from 'zustand/shallow';

export default function CreateQuizGeneralPage() {
  const theme = useTheme();
  const router = useRouter();
  const { title, setTitle, description, setDescription } = useQuizDraft(
    (state) => ({
      title: state.title,
      setTitle: state.setTitle,
      description: state.description,
      setDescription: state.setDescription,
      questions: state.questions,
    }),
    shallow
  );

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    router.push('/quiz/create/2-questions');
  }

  return (
    <Box>
      <Typography variant="h1">
        <span>Create your </span>
        <GradientWord>quiz</GradientWord>
        <span>.</span>
      </Typography>
      <Card>
        <form onSubmit={onSubmit}>
          <CardContent></CardContent>
          <CardActions
            sx={{
              display: 'flex',
              alignItems: 'center',
              flexWrap: 'wrap',
              margin: 1,
            }}
            disableSpacing
          >
            <HomeButton>Cancel</HomeButton>
          </CardActions>
        </form>
      </Card>
    </Box>
  );
}
