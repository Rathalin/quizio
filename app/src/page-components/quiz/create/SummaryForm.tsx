import IndexAvatar from '../game/IndexAvatar';
import { QuizOverviewForm, QuizQuestionsForm } from '../quiz-form-schema';
import LoadingCircle from '@/components/LoadingCircle';
import BackButton from './BackButton';
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
import Dialog from '@mui/material/Dialog';
import { useState } from 'react';
import DialogTitle from '@mui/material/DialogTitle';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';

type SummaryFormProps = {
  overviewFormData: QuizOverviewForm;
  questionsFormData: QuizQuestionsForm;
  backLabel: string | null;
  onBack: () => void;
  editMode: boolean;
  onCreate: (publish: boolean) => void;
  onUpdate: () => void;
  isPending: boolean;
  isDisabled: boolean;
};

export default function SummaryForm({
  overviewFormData,
  questionsFormData,
  backLabel,
  onBack,
  onCreate,
  onUpdate,
  editMode,
  isPending,
  isDisabled,
}: SummaryFormProps) {
  const t = useTranslations('quizForm.summary');
  const theme = useTheme();
  const { title, description } = overviewFormData;
  const { questions } = questionsFormData;

  const [open, setOpen] = useState(false);

  function handleOpen() {
    setOpen(true);
  }

  function handleClose() {
    setOpen(false);
  }

  return (
    <>
      <Dialog open={open} onClose={handleClose}>
        <DialogTitle variant="h5" sx={{ marginBottom: 2 }}>
          {t('create.dialog.title')}
        </DialogTitle>
        <DialogContent>{t('create.dialog.content')}</DialogContent>
        <DialogActions>
          <Button color="inherit" onClick={handleClose}>
            {t('dialog.action.cancel.label')}
          </Button>
          <Button
            onClick={() => onCreate(false)}
            startIcon={isPending ? <LoadingCircle /> : null}
            disabled={isPending}
            autoFocus
          >
            {t('dialog.action.create.label')}
          </Button>
          <Button
            onClick={() => onCreate(true)}
            startIcon={isPending ? <LoadingCircle /> : null}
            disabled={isPending}
            autoFocus
          >
            {t('dialog.action.publish.label')}
          </Button>
        </DialogActions>
      </Dialog>
      <Card>
        <CardContent>
          <Typography
            variant="h3"
            component="h2"
            sx={{
              marginTop: 1,
              marginBottom: 3,
            }}
          >
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
                      <Typography variant="h5" component="h3">
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
                        <Typography component="span" color={theme.vars.palette.primary.main}>
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
              onClick={onUpdate}
              startIcon={isPending ? <LoadingCircle /> : <SaveIcon />}
              disabled={isDisabled}
            >
              {t('update.label')}
            </Button>
          ) : (
            <Button
              variant="contained"
              color="primary"
              onClick={handleOpen}
              startIcon={isPending ? <LoadingCircle /> : <SaveIcon />}
              disabled={isDisabled}
            >
              {t('create.label')}
            </Button>
          )}
        </CardActions>
      </Card>
    </>
  );
}
