import GradientWord from '@/components/GradientWord';
import { useQuizDraft } from '@/stores/quiz-draft.store';
import {
  Box,
  Button,
  Card,
  CardActions,
  CardContent,
  CardHeader,
  TextField,
  Typography,
} from '@mui/material';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useState } from 'react';

export default function CreateQuizGeneralPage() {
  const router = useRouter();
  const { draft, setDraft } = useQuizDraft();
  const [titleInput, setTitleInput] = useState(draft.title);
  const [descriptionInput, setDescriptionInput] = useState(draft.description);
  return (
    <Box>
      <Typography variant="h1">
        <span>Create your </span>
        <GradientWord>quiz</GradientWord>
        <span>.</span>
      </Typography>
      <Card>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            console.log('setDraft');
            setDraft({
              title: titleInput,
              description: descriptionInput,
              questions: [],
            });
            router.push('/create/2-questions');
          }}
        >
          <CardContent>
            <Box>
              <Box sx={{ marginBottom: 2 }}>
                <TextField
                  id="quiz-title"
                  name="title"
                  label="Title"
                  value={titleInput}
                  onChange={(e) => setTitleInput(e.target.value)}
                  required
                  fullWidth
                />
              </Box>
              <Box sx={{ marginBottom: 2 }}>
                <TextField
                  id="quiz-desc"
                  name="description"
                  label="Description"
                  value={descriptionInput}
                  onChange={(e) => setDescriptionInput(e.target.value)}
                  fullWidth
                />
              </Box>
            </Box>
          </CardContent>
          <CardActions
            sx={{
              display: 'flex',
              alignItems: 'center',
              flexWrap: 'wrap',
              margin: 1,
            }}
          >
            <Link href="/">
              <Button type="button">Cancel</Button>
            </Link>
            <Button
              sx={{ marginLeft: 'auto' }}
              variant="contained"
              type="submit"
            >
              Next
            </Button>
          </CardActions>
        </form>
      </Card>
    </Box>
  );
}
