import { QuizCreateFormFields } from '@/pages/quiz/create/index.page';
import { Check as CheckIcon, Clear as ClearIcon } from '@mui/icons-material';
import { Box, Divider, List, ListItem, Typography } from '@mui/material';
import { useFormContext } from 'react-hook-form';

export default function SummaryForm() {
  const { getValues } = useFormContext();

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
