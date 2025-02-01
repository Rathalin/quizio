import IndexAvatar from '../game/IndexAvatar';
import { QuizOverviewForm, QuizQuestionsForm } from '../quiz-form-schema';
import LoadingCircle from '@/components/LoadingCircle';
import BackButton from './BackButton';
import PublishIcon from '@mui/icons-material/Publish';
import CheckIcon from '@mui/icons-material/Check';
import ClearIcon from '@mui/icons-material/Clear';
import { useTheme } from '@mui/material/styles';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import Divider from '@mui/material/Divider';
import List from '@mui/material/List';
import Box from '@mui/material/Box';
import ListItem from '@mui/material/ListItem';
import Stack from '@mui/material/Stack';
import CardActions from '@mui/material/CardActions';
import Button from '@mui/material/Button';
import { useTranslations } from 'next-intl';
import SaveIcon from '@mui/icons-material/Save';

type SummaryFormProps = {
  overviewFormData: QuizOverviewForm;
  questionsFormData: QuizQuestionsForm;
  backLabel: string | null;
  onBack: () => void;
  editMode: boolean;
  onSubmit: () => void;
  isPending: boolean;
  isDisabled: boolean;
};

export default function SummaryForm({
  overviewFormData,
  questionsFormData,
  backLabel,
  onBack,
  editMode,
  onSubmit,
  isPending,
  isDisabled,
}: SummaryFormProps) {
  const t = useTranslations('quizForm.summary');
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
        <Divider sx={{ marginTop: 2 }} />
        <List>
          {questions.map((question, qIndex) => (
            <Box key={`question-${qIndex}`}>
              {qIndex > 0 && <Divider sx={{ marginBottom: 1 }} />}
              <ListItem>
                <Box>
                  <Stack direction="row" alignItems="center" gap={2}>
                    <IndexAvatar index={qIndex + 1} />
                    <Typography variant="h5" component="h3" sx={{ marginBlock: 0 }}>
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
                        {answer.isCorrect ? <CheckIcon color="success" /> : <ClearIcon color="error" />}
                        <Box>{answer.title}</Box>
                      </ListItem>
                    ))}
                  </List>
                  {question.explanation != null && question.explanation.length > 0 && (
                    <Box sx={{ marginBottom: 2 }}>
                      <Typography component="span" color={theme.palette.primary.main}>
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
            startIcon={isPending ? <LoadingCircle /> : <SaveIcon />}
            disabled={isDisabled}
          >
            {t('updateQuiz.label')}
          </Button>
        ) : (
          <Button
            variant="contained"
            color="primary"
            onClick={onSubmit}
            startIcon={isPending ? <LoadingCircle /> : <PublishIcon />}
            disabled={isDisabled}
          >
            {t('publishQuiz.label')}
          </Button>
        )}
      </CardActions>
    </Card>
  );
}
