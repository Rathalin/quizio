import GradientWord from '@/components/GradientWord';
import LinkButton from '@/components/LinkButton';
import QuestionInput from '@/page-components/create/question/QuestionInput';
import { useQuizDraft } from '@/stores/quiz-draft.store';
import {
  AddOutlined,
  ArrowBackOutlined,
  ArrowForwardOutlined,
} from '@mui/icons-material';
import {
  Box,
  Card,
  CardContent,
  Typography,
  CardActions,
  Button,
} from '@mui/material';
import { shallow } from 'zustand/shallow';

export default function CreateQuizQuestionsPage() {
  const { questions, setQuestion } = useQuizDraft(
    (state) => ({ questions: state.questions, setQuestion: state.setQuestion }),
    shallow
  );

  return (
    <Box>
      <Typography variant="h1">
        <span>Add </span>
        <GradientWord>questions</GradientWord>
        <span>.</span>
      </Typography>
      <Card>
        <CardContent>
          {questions.map((question, index) => (
            <QuestionInput
              index={index}
              question={question}
              setQuestion={(q) => setQuestion(q, index)}
              onDelete={() => {}}
            />
          ))}
          <Box sx={{ display: 'flex', justifyContent: 'center', marginTop: 2 }}>
            <Button startIcon={<AddOutlined />} variant="outlined">
              Another Question
            </Button>
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
            hrefObserver="/create/1-general"
            navigateOnClick
            variant="outlined"
            iconSide="right"
            startIcon={<ArrowBackOutlined />}
          >
            Title and description
          </LinkButton>
          <LinkButton
            sx={{ marginLeft: 'auto' }}
            hrefObserver="/create/3-summary"
            navigateOnClick
            variant="contained"
            endIcon={<ArrowForwardOutlined />}
          >
            View summary
          </LinkButton>
        </CardActions>
      </Card>
    </Box>
  );
}
