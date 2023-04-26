import GradientWord from '@/components/GradientWord';
import QuestionInput from '@/page-components/create/question-input/QuestionInput';
import {
  Box,
  Card,
  CardContent,
  TextField,
  Button,
  Typography,
  CardActions,
} from '@mui/material';
import Link from 'next/link';

export default function CreateQuizQuestionsPage() {
  return (
    <Box>
      <Typography variant="h1">
        <span>Add </span>
        <GradientWord>questions</GradientWord>
        <span>.</span>
      </Typography>
      <Card>
        <CardContent>
          <QuestionInput />
        </CardContent>
        <CardActions
          sx={{
            display: 'flex',
            alignItems: 'center',
            flexWrap: 'wrap',
            margin: 1,
          }}
        >
          <Link href="/create/1-general">
            <Button type="button">Back</Button>
          </Link>
          <Button sx={{ marginLeft: 'auto' }} variant="contained">
            Next
          </Button>
        </CardActions>
      </Card>
    </Box>
  );
}
