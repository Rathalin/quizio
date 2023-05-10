import GradientWord from '@/components/GradientWord';
import LinkButton from '@/components/LinkButton';
import QuestionInput from '@/page-components/create/question/QuestionInput';
import {
  AnswerDraft,
  QuestionDraft,
  useQuizDraft,
} from '@/stores/quiz-draft.store';
import {
  Add as AddIcon,
  ArrowBack as ArrowBackIcon,
  ArrowForward as ArrowForwardIcon,
} from '@mui/icons-material';
import { Box, Typography, Button } from '@mui/material';
import { shallow } from 'zustand/shallow';

export default function CreateQuizQuestionsPage() {
  const { questions, setQuestions } = useQuizDraft(
    (state) => ({
      questions: state.questions,
      setQuestions: state.setQuestions,
    }),
    shallow
  );
  const minAnswers = 2;

  function addQuestion() {
    setQuestions([
      ...questions,
      {
        title: '',
        answers: Array<AnswerDraft>(minAnswers).fill({
          text: '',
          isCorrect: false,
        }),
      },
    ]);
  }

  function setQuestion(question: QuestionDraft, index: number) {
    setQuestions(questions.map((q, i) => (i === index ? question : q)));
  }

  function deleteQuestion(index: number) {
    setQuestions(questions.filter((_, i) => i !== index));
  }

  return (
    <Box>
      <Typography variant="h1">
        <span>Add </span>
        <GradientWord>questions</GradientWord>
        <span>.</span>
      </Typography>
      <Box>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          {questions.map((question, index) => (
            <QuestionInput
              key={index}
              index={index}
              question={question}
              setQuestion={(q) => setQuestion(q, index)}
              onDelete={() => deleteQuestion(index)}
            />
          ))}
        </Box>
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'center',
            marginTop: 2,
            marginBottom: 2,
          }}
        >
          <Button
            startIcon={<AddIcon />}
            variant="outlined"
            onClick={() => addQuestion()}
          >
            Another Question
          </Button>
        </Box>
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            flexWrap: 'wrap',
          }}
        >
          <LinkButton
            hrefObserver="/create/1-general"
            navigateOnClick
            variant="outlined"
            iconSide="right"
            startIcon={<ArrowBackIcon />}
          >
            Title and description
          </LinkButton>
          <LinkButton
            sx={{ marginLeft: 'auto' }}
            hrefObserver="/create/3-summary"
            navigateOnClick
            variant="contained"
            endIcon={<ArrowForwardIcon />}
          >
            View summary
          </LinkButton>
        </Box>
      </Box>
    </Box>
  );
}
