import GradientWord from '@/components/GradientWord';
import LinkButton from '@/components/LinkButton';
import { useQuizDraft } from '@/stores/quiz-draft.store';
import { ArrowForward as ArrowForwardIcon } from '@mui/icons-material';
import {
  Box,
  Button,
  Card,
  CardActions,
  CardContent,
  Stack,
  TextField,
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
          <CardContent>
            <Stack direction="column" gap={2} flexWrap="wrap">
              <Stack direction="column" gap={2} sx={{ flexGrow: 1 }}>
                <Box>
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
                <Box>
                  <TextField
                    id="quiz-desc"
                    name="description"
                    label="Description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    fullWidth
                  />
                </Box>
              </Stack>
              <Stack direction="row" alignItems="center">
                <input
                  id="quiz-image"
                  type="file"
                  accept="image/*"
                  style={{ display: 'none' }}
                />
                <label
                  htmlFor="quiz-image"
                  style={{
                    display: 'flex',
                    flexGrow: 1,
                  }}
                >
                  <Button
                    variant="outlined"
                    component="span"
                    sx={{
                      padding: 4,
                      minWidth: '16rem',
                      minHeight: '180px',
                    }}
                  >
                    Upload image
                  </Button>
                </label>
              </Stack>
            </Stack>
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
              hrefObserver="/quiz/create/2-questions"
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
