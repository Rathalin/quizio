import GradientWord from '@/components/GradientWord';
import LinkButton from '@/components/LinkButton';
import { useQuizDraft } from '@/stores/quiz-draft.store';
import {
  ArrowBackOutlined,
  CheckOutlined,
  ClearOutlined,
} from '@mui/icons-material';
import {
  Box,
  Card,
  CardActions,
  CardContent,
  Divider,
  List,
  ListItem,
  Typography,
} from '@mui/material';
import { shallow } from 'zustand/shallow';

export default function CreateQuizSummaryPage() {
  const { title, description, questions } = useQuizDraft(
    (state) => ({
      title: state.title,
      description: state.description,
      questions: state.questions,
    }),
    shallow
  );

  return (
    <Box>
      <Typography variant="h1">
        <span>The </span>
        <GradientWord>summary</GradientWord>
        <span>.</span>
      </Typography>
      <Card>
        <CardContent>
          <Typography variant="h3" component="h2">
            {title}
          </Typography>
          <Typography variant="body1">{description}</Typography>
          <List>
            {questions.map((question, qIndex) => (
              <>
                {qIndex > 0 && <Divider />}
                <ListItem key={`question-${qIndex}`}>
                  <Box>
                    <Typography variant="h5" component="h3">{`${qIndex + 1}) ${
                      question.title
                    }`}</Typography>
                    <List>
                      {question.answers.map((answer, aIndex) => (
                        <ListItem
                          key={`question-${aIndex}-answer-${aIndex}`}
                          sx={{
                            display: 'flex',
                            alignItems: 'center',
                            columnGap: 3,
                          }}
                        >
                          {answer.isCorrect ? (
                            <CheckOutlined color="success" />
                          ) : (
                            <ClearOutlined color="error" />
                          )}
                          <Box>{answer.text}</Box>
                        </ListItem>
                      ))}
                    </List>
                  </Box>
                </ListItem>
              </>
            ))}
          </List>
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
            hrefObserver="/create/2-questions"
            navigateOnClick
            variant="outlined"
            iconSide="right"
            startIcon={<ArrowBackOutlined />}
          >
            Edit questions
          </LinkButton>
          <LinkButton
            hrefObserver="/"
            navigateOnClick
            sx={{ marginLeft: 'auto' }}
            variant="contained"
          >
            Finish quiz
          </LinkButton>
        </CardActions>
      </Card>
    </Box>
  );
}
