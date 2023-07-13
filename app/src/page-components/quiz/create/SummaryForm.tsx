import {
  Check as CheckIcon,
  Clear as ClearIcon,
  Publish as PublishIcon,
} from '@mui/icons-material';
import {
  Box,
  Button,
  Card,
  CardActions,
  CardContent,
  Divider,
  List,
  ListItem,
  Stack,
  Typography,
} from '@mui/material';
import IndexAvatar from '../game/IndexAvatar';
import { QuizOverviewForm, QuizQuestionsForm } from '../quiz-form-schema';
import LoadingCircle from '@/components/LoadingCircle';

type SummaryFormProps = {
  overviewFormData: QuizOverviewForm;
  questionsFormData: QuizQuestionsForm;
  onBack: () => void;
  onPublish: () => void;
  isPublishing: boolean;
};

export default function SummaryForm({
  overviewFormData,
  questionsFormData,
  onBack,
  onPublish,
  isPublishing,
}: SummaryFormProps) {
  const { title, description } = overviewFormData;
  const { questions } = questionsFormData;

  return (
    <Card>
      <CardContent>
        <Typography variant="h3" component="h2">
          {title}
        </Typography>
        <Typography variant="body1">{description}</Typography>
        <List>
          {questions.map((question, qIndex) => (
            <Box key={`question-${qIndex}`}>
              {qIndex > 0 && <Divider />}
              <ListItem>
                <Box>
                  <Stack direction="row" alignItems="center" gap={2}>
                    <IndexAvatar index={qIndex + 1} />
                    <Typography
                      variant="h5"
                      component="h3"
                      sx={{ marginBlock: 0 }}
                    >
                      {question.title}
                    </Typography>
                  </Stack>
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
                          <CheckIcon color="success" />
                        ) : (
                          <ClearIcon color="error" />
                        )}
                        <Box>{answer.title}</Box>
                      </ListItem>
                    ))}
                  </List>
                </Box>
              </ListItem>
            </Box>
          ))}
        </List>
      </CardContent>
      <CardActions>
        <Button
          variant="contained"
          color="primary"
          onClick={onPublish}
          startIcon={isPublishing ? <LoadingCircle /> : null}
          endIcon={<PublishIcon />}
          disabled={isPublishing}
        >
          Publish quiz
        </Button>
      </CardActions>
    </Card>
  );
}
