import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Box,
  Button,
  FormHelperText,
  InputAdornment,
  Stack,
  Tooltip,
  Typography,
  useTheme,
} from '@mui/material';
import AnswerInput from './answer/AnswerInput';
import {
  Add as AddIcon,
  ExpandMore as ExpandMoreIcon,
  Help,
} from '@mui/icons-material';
import DeleteQuestionButton from './DeleteQuestionButton';
import { Controller, useFieldArray, useFormContext } from 'react-hook-form';
import { useQuestionIndex } from './QuestionIndexContext';
import { AnswerIndexContext } from './answer/AnswerIndexContext';
import QuizioTextField from '@/components/inputs/QuizioTextField';
import { defaultAnswerFormData } from '../../quiz-form-data';
import {
  QuizQuestionsForm,
  maxAnswers,
  minAnswers,
} from '../../quiz-form-schema';
import { constraints } from '@/content-type-utilities/content-type-constraints';
import { ZodFieldErrors } from '../../../../../types/hook-form-zod';
import { FormErrorIcon } from '../../FormErrorIcon';

type QuestionInputProps = {
  deletable: boolean;
  onDelete: () => void;
  expanded: boolean;
  onExpand: () => void;
};

export default function QuestionInput({
  deletable,
  onDelete,
  expanded,
  onExpand,
}: QuestionInputProps) {
  const theme = useTheme();
  const index = useQuestionIndex();
  const {
    control,
    getValues,
    formState: { errors: formErrors },
    watch,
  } = useFormContext<QuizQuestionsForm>();
  const name = `questions.${index}` as const;
  const { fields, append, remove } = useFieldArray<QuizQuestionsForm>({
    name: `${name}.answers` as 'questions.0.answers',
    control,
    rules: {
      minLength: minAnswers,
      maxLength: maxAnswers,
    },
  });
  const errors = formErrors as ZodFieldErrors<typeof formErrors>;
  const questionErrors = errors.questions?.[index] ?? null;
  const oneCorrectAnswerError =
    (
      questionErrors?.answers as {
        oneCorrectAnswer?: {
          message?: string;
        };
      }
    )?.oneCorrectAnswer?.message?.toString() ?? '';

  return (
    <Accordion
      elevation={4}
      expanded={expanded}
      onChange={() => onExpand()}
      TransitionProps={{ unmountOnExit: true }}
    >
      <AccordionSummary expandIcon={<ExpandMoreIcon />}>
        <Stack
          direction="row"
          alignItems="center"
          justifyContent="space-between"
          sx={{ flex: 1 }}
        >
          <Stack gap={0}>
            <Stack
              direction="row"
              alignItems="center"
              columnGap={3}
              rowGap={1}
              flexWrap="wrap"
              sx={{ flex: 1 }}
            >
              <Typography
                variant="h5"
                sx={{
                  marginBlock: 0,
                }}
              >
                {`Question ${index + 1}`}
              </Typography>
              <Tooltip title="Some inputs require your attention." arrow>
                <Box
                  sx={{
                    visibility: questionErrors != null ? 'visible' : 'hidden',
                  }}
                >
                  <FormErrorIcon />
                </Box>
              </Tooltip>
            </Stack>
            <Typography
              variant="body2"
              sx={{ color: theme.palette.text.disabled }}
            >
              {watch(`${name}.title`)}
            </Typography>
          </Stack>
          <DeleteQuestionButton disabled={!deletable} onDelete={onDelete} />
        </Stack>
      </AccordionSummary>
      <AccordionDetails>
        <Box
          sx={{
            marginBottom: 4,
            gap: 2,
            display: 'flex',
          }}
        >
          <Controller
            name={`${name}.title`}
            render={({ field }) => (
              <QuizioTextField
                id={`${name}.title`}
                label="Question"
                fullWidth
                error={questionErrors?.title != null}
                helperText={questionErrors?.title?.message?.toString() ?? ''}
                required
                inputProps={{
                  maxLength: constraints.quiz.question.title.maxLength,
                }}
                {...field}
              />
            )}
            rules={{ required: true }}
            control={control}
          />
        </Box>
        <Box>
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              gap: 2,
              marginBottom: 2,
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
          <FormHelperText sx={{ marginBottom: 2 }} error>
            {oneCorrectAnswerError}
          </FormHelperText>

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
                  onClick={() => append(defaultAnswerFormData)}
                  disabled={fields.length >= maxAnswers}
                >
                  Answer
                </Button>
              </Box>
            </Tooltip>
          </Box>

          <Box sx={{ marginTop: 4 }}>
            <Controller
              name={`${name}.explanation`}
              render={({ field }) => (
                <QuizioTextField
                  id={`${name}.explanation`}
                  label="Explanation"
                  fullWidth
                  multiline
                  inputProps={{
                    maxLength: constraints.quiz.question.explanation.maxLength,
                  }}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Tooltip
                          title="Explain the correct answer or give some context. This input is optional."
                          arrow
                        >
                          <Help />
                        </Tooltip>
                      </InputAdornment>
                    ),
                  }}
                  {...field}
                />
              )}
              control={control}
            />
          </Box>
        </Box>
      </AccordionDetails>
    </Accordion>
  );
}
