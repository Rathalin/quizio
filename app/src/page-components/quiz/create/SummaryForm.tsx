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
  useTheme,
} from '@mui/material';
import IndexAvatar from '../game/IndexAvatar';
import { QuizOverviewForm, QuizQuestionsForm } from '../quiz-form-schema';
import LoadingCircle from '@/components/LoadingCircle';
import BackButton from './BackButton';

type SummaryFormProps = {
  overviewFormData: QuizOverviewForm;
  questionsFormData: QuizQuestionsForm;
  backLabel: string | null;
  onBack: () => void;
  editMode: boolean;
  onSubmit: () => void;
  isLoading: boolean;
  isDisabled: boolean;
};

export default function SummaryForm({
  overviewFormData,
  questionsFormData,
  backLabel,
  onBack,
  editMode,
  onSubmit,
  isLoading,
  isDisabled,
}: SummaryFormProps) {
  const theme = useTheme();
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
                  {question.explanation != null &&
                    question.explanation.length > 0 && (
                      <Box sx={{ marginBottom: 2 }}>
                        <Typography
                          component="span"
                          color={theme.palette.primary.main}
                        >
                          Explanation:
                        </Typography>
                        <Typography component="span" sx={{ marginLeft: 1 }}>
                          {question.explanation}
                        </Typography>
                      </Box>
                    )}
                </Box>
              </ListItem>
            </Box>
          ))}
        </List>
      </CardContent>
      <CardActions sx={{ padding: 2, justifyContent: 'space-between' }}>
        <BackButton onClick={() => onBack()}>{backLabel}</BackButton>
        {editMode ? (
          <Button
            variant="contained"
            onClick={onSubmit}
            startIcon={isLoading ? <LoadingCircle /> : undefined}
            endIcon={<PublishIcon />}
            disabled={isDisabled}
          >
            Update quiz
          </Button>
        ) : (
          <Button
            variant="contained"
            color="primary"
            onClick={onSubmit}
            startIcon={isLoading ? <LoadingCircle /> : null}
            endIcon={<PublishIcon />}
            disabled={isDisabled}
          >
            Publish quiz
          </Button>
        )}
      </CardActions>
    </Card>
  );
}
