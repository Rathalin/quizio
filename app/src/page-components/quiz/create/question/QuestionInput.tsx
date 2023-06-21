import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Box,
  Button,
  FormHelperText,
  Stack,
  Tooltip,
  Typography
} from '@mui/material';
import AnswerInput from './answer/AnswerInput';
import {
  Add as AddIcon,
  ExpandMore as ExpandMoreIcon,
  ReportProblem as ReportProblemIcon
} from '@mui/icons-material';
import DeleteQuestionButton from './DeleteQuestionButton';
import {
  Controller,
  useFieldArray,
  useFormContext,
  useWatch
} from 'react-hook-form';
import { useQuestionIndex } from './QuestionIndexContext';
import { AnswerIndexContext } from './answer/AnswerIndexContext';
import QuizioTextField from '@/components/inputs/QuizioTextField';
import { QuizCreateFormFields } from '@/pages/quiz/create/index.page';
import { maxLengths } from '@/stores/max-lengths';

type QuestionInputProps = {
  deletable: boolean;
  onDelete: () => void;
};
const minAnswers = 2;
const maxAnswers = 20;

export default function QuestionInput({
  deletable,
  onDelete
}: QuestionInputProps) {
  const index = useQuestionIndex();
  const {
    control,
    formState: { errors, isValid },
    getValues,
    watch
  } = useFormContext<QuizCreateFormFields>();
  const name = `questions.${index}` as const;
  const { fields, append, remove } = useFieldArray<QuizCreateFormFields>({
    name: `${name}.answers` as 'questions.0.answers',
    control,
    rules: {
      minLength: minAnswers,
      maxLength: maxAnswers
    }
  });

  const questionError = errors.questions?.[index];
  const hasError =
    questionError?.title != null || questionError?.answers != null;

  let titleError: string | null = null;
  if (questionError?.title?.type === 'required') {
    titleError = 'Question is required';
  }

  const hasCorrectAnswer =
    useWatch({
      name: `questions.${index}`,
      control
    }).answers.filter((answer) => answer.isCorrect).length === 1;
  let hasCorrectAnswerError: string | null = null;
  if (!hasCorrectAnswer) {
    hasCorrectAnswerError = 'Exactly one answer must be correct';
  }

  return (
    <Accordion elevation={4} defaultExpanded>
      <AccordionSummary expandIcon={<ExpandMoreIcon />}>
        <Stack
          direction="row"
          alignItems="center"
          justifyContent="space-between"
          sx={{ flex: 1 }}
        >
          <Stack direction="row" alignItems="center" gap={4} sx={{ flex: 1 }}>
            <Typography
              variant="h5"
              sx={{
                marginBlock: 0
              }}
            >
              {`Question ${index + 1}`}
            </Typography>
            {hasError && (
              <Tooltip title="Some inputs require your attention." arrow>
                <ReportProblemIcon color="error" />
              </Tooltip>
            )}
          </Stack>
          <DeleteQuestionButton disabled={!deletable} onDelete={onDelete} />
        </Stack>
      </AccordionSummary>
      <AccordionDetails>
        <Box
          sx={{
            marginBottom: 4,
            gap: 2,
            display: 'flex'
          }}
        >
          <Controller
            name={`${name}.title`}
            render={({ field }) => (
              <QuizioTextField
                id={`${name}.title`}
                label="Question"
                fullWidth
                error={titleError != null}
                helperText={titleError}
                inputProps={{ maxLength: maxLengths.question.title }}
                {...field}
              />
            )}
            rules={{ required: true }}
            control={control}
          />
          <Box sx={{ marginTop: 1 }}></Box>
        </Box>
        <Box>
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              gap: 2,
              marginBottom: 2
            }}
          >
            {fields.map((field, index) => (
              <AnswerIndexContext.Provider key={field.id} value={index}>
                <AnswerInput
                  onDelete={() => remove(index)}
                  minAnswers={minAnswers}
                  isCorrect={getValues(`${name}.answers.${index}.isCorrect`)}
                  deletable={fields.length > minAnswers}
                />
              </AnswerIndexContext.Provider>
            ))}
          </Box>
          <FormHelperText error>{hasCorrectAnswerError}</FormHelperText>

          <Box sx={{ display: 'flex', justifyContent: 'center' }}>
            <Tooltip
              title={
                fields.length >= maxAnswers
                  ? `You can only add ${maxAnswers} answers.`
                  : null
              }
              arrow
            >
              <Box>
                <Button
                  variant="outlined"
                  startIcon={<AddIcon />}
                  onClick={() => append({ title: '', isCorrect: false })}
                  disabled={fields.length >= maxAnswers}
                >
                  Answer
                </Button>
              </Box>
            </Tooltip>
          </Box>
        </Box>
      </AccordionDetails>
    </Accordion>
  );
}
