import GradientWord from '@/components/GradientWord';
import LinkButton from '@/components/LinkButton';
import { useQuizDraft } from '@/stores/quiz-draft.store';
import { ArrowForward as ArrowForwardIcon } from '@mui/icons-material';
import {
  Box,
  Card,
  CardActions,
  CardContent,
  TextField,
  Typography,
} from '@mui/material';
import { useRouter } from 'next/router';
import { FormEvent } from 'react';
import { shallow } from 'zustand/shallow';

export default function CreateQuizGeneralPage() {
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
    router.push('/create/2-questions');
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
          <CardContent>
            <Box sx={{ marginBottom: 2 }}>
              <TextField
                id="quiz-title"
                name="title"
                label="Title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                fullWidth
              />
            </Box>
            <Box sx={{ marginBottom: 2 }}>
              <TextField
                id="quiz-desc"
                name="description"
                label="Description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                fullWidth
              />
            </Box>
          </CardContent>
          <CardActions
            sx={{
              display: 'flex',
              alignItems: 'center',
              flexWrap: 'wrap',
              margin: 1,
            }}
            disableSpacing
          >
            <LinkButton
              hrefObserver="/"
              navigateOnClick
              iconSide="right"
              variant="outlined"
            >
              Cancel
            </LinkButton>
            <LinkButton
              hrefObserver="/create/2-questions"
              type="submit"
              sx={{ marginLeft: 'auto' }}
              variant="contained"
              endIcon={<ArrowForwardIcon />}
            >
              Add questions
            </LinkButton>
          </CardActions>
        </form>
      </Card>
    </Box>
  );
}
