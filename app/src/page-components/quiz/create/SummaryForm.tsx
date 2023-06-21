import { QuizCreateFormFields } from '@/pages/quiz/create/index.page';
import { Check as CheckIcon, Clear as ClearIcon } from '@mui/icons-material';
import {
  Box,
  Divider,
  List,
  ListItem,
  Stack,
  Typography,
  useTheme
} from '@mui/material';
import { useFormContext } from 'react-hook-form';
import IndexAvatar from '../game/IndexAvatar';

export default function SummaryForm() {
  const { getValues } = useFormContext();
  const theme = useTheme();

  const { title, description, questions } = getValues() as QuizCreateFormFields;

  return (
    <Box>
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
                  <IndexAvatar
                    index={qIndex + 1}
                    color={theme.palette.action.disabled}
                  />
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
                        columnGap: 3
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
    </Box>
  );
}
