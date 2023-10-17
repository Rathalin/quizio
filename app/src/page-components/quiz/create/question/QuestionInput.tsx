import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Box,
  Button,
  Divider,
  FormHelperText,
  InputAdornment,
  Stack,
  Tooltip,
  Typography,
  useTheme,
} from '@mui/material';
import AnswerInput from './answer/AnswerInput';
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
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import AddIcon from '@mui/icons-material/Add';
import InfoIcon from '@mui/icons-material/Info';
import { ClearImageInputIcon } from '../ClearImageInputIcon';
import { useGameImageInputDimensions } from '../useImageInputDimensions';
import { useMemo } from 'react';
import Image from 'next/image';

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
  const { width: imageWidth, height: imageHeight } =
    useGameImageInputDimensions();
  const {
    control,
    getValues,
    formState: { errors: formErrors },
    watch,
    setValue,
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

  const questionImageFile = watch(
    `${name}.questionImage.data.file`
  ) as File | null;
  const questionPreviewImage = watch(`${name}.questionImage.preview`);
  const questionImageUrl = useMemo(() => {
    if (questionImageFile != null) {
      return URL.createObjectURL(questionImageFile);
    }
    return questionPreviewImage?.url ?? null;
  }, [questionImageFile, questionPreviewImage]);
  const questionImageName = useMemo(() => {
    if (questionImageFile != null) {
      return questionImageFile?.name?.split('\\').pop()?.split('/').pop();
    }
    return questionPreviewImage?.name;
  }, [questionImageFile, questionPreviewImage?.name]);

  const explanationImageFile = watch(
    `${name}.explanationImage.data.file`
  ) as File | null;
  const explanationPreviewImage = watch(`${name}.explanationImage.preview`);
  const explanationImageUrl = useMemo(() => {
    if (explanationImageFile != null) {
      return URL.createObjectURL(explanationImageFile);
    }
    return explanationPreviewImage?.url ?? null;
  }, [explanationImageFile, explanationPreviewImage]);
  const explanationImageName = useMemo(() => {
    if (explanationImageFile != null) {
      return explanationImageFile?.name?.split('\\').pop()?.split('/').pop();
    }
    return explanationPreviewImage?.name;
  }, [explanationImageFile, explanationPreviewImage?.name]);

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
                <Stack
                  sx={{
                    visibility: questionErrors != null ? 'visible' : 'hidden',
                  }}
                >
                  <FormErrorIcon />
                </Stack>
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
        <Stack
          display="inline-flex"
          alignItems="center"
          gap={1}
          sx={{ marginBottom: 4 }}
        >
          <Controller
            name={`${name}.questionImage.data.file`}
            render={({ field }) => (
              <Box>
                <input
                  {...field}
                  id={`${name}.questionImage.data.file`}
                  type="file"
                  accept="image/*"
                  style={{ display: 'none' }}
                  value={undefined}
                  onChange={(e) => {
                    setValue(
                      `${name}.questionImage.data.file`,
                      e.target.files != null ? e.target.files[0] : null
                    );
                  }}
                />
                <label
                  htmlFor={`${name}.questionImage.data.file`}
                  style={{
                    display: 'flex',
                  }}
                >
                  <Button
                    variant="outlined"
                    component="span"
                    sx={{
                      paddingTop: 2,
                      minWidth: imageWidth,
                      minHeight: imageHeight,
                    }}
                  >
                    {questionImageUrl != null ? (
                      <Stack alignItems="center">
                        <Image
                          src={questionImageUrl}
                          width={imageWidth}
                          height={imageHeight}
                          alt={`${name}.questionImage.data.file input`}
                          style={{
                            borderRadius: 2,
                            objectFit: 'cover',
                          }}
                          unoptimized
                        />
                        <Box sx={{ overflowWrap: 'anywhere' }}>
                          {questionImageName}
                        </Box>
                      </Stack>
                    ) : (
                      <Box>{'Upload question image'}</Box>
                    )}
                  </Button>
                </label>
              </Box>
            )}
            control={control}
          />
          <Button
            variant="outlined"
            color="error"
            startIcon={<ClearImageInputIcon />}
            onClick={() => {
              setValue(`${name}.questionImage.data.file`, null);
              setValue(`${name}.questionImage.preview`, undefined);
            }}
            disabled={questionImageUrl == null}
          >
            {'Remove'}
          </Button>
        </Stack>
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
                  {'Answer'}
                </Button>
              </Box>
            </Tooltip>
          </Box>
          <Divider sx={{ marginBlock: 4 }} />
          <Stack display="inline-flex" alignItems="center" gap={1}>
            <Controller
              name={`${name}.explanationImage.data.file`}
              render={({ field }) => (
                <Box>
                  <input
                    {...field}
                    id={`${name}.explanationImage.data.file`}
                    type="file"
                    accept="image/*"
                    style={{ display: 'none' }}
                    value={undefined}
                    onChange={(e) => {
                      setValue(
                        `${name}.explanationImage.data.file`,
                        e.target.files != null ? e.target.files[0] : null
                      );
                    }}
                  />
                  <label
                    htmlFor={`${name}.explanationImage.data.file`}
                    style={{
                      display: 'flex',
                    }}
                  >
                    <Button
                      variant="outlined"
                      component="span"
                      sx={{
                        paddingTop: 2,
                        minWidth: imageWidth,
                        minHeight: imageHeight,
                      }}
                    >
                      {explanationImageUrl != null ? (
                        <Stack alignItems="center">
                          <Image
                            src={explanationImageUrl}
                            width={imageWidth}
                            height={imageHeight}
                            alt={`${name}.explanationImage.data.file input`}
                            style={{
                              borderRadius: 2,
                              objectFit: 'cover',
                            }}
                            unoptimized
                          />
                          <Box sx={{ overflowWrap: 'anywhere' }}>
                            {explanationImageName}
                          </Box>
                        </Stack>
                      ) : (
                        <Box>{'Upload explanation image'}</Box>
                      )}
                    </Button>
                  </label>
                </Box>
              )}
              control={control}
            />
            <Button
              variant="outlined"
              color="error"
              startIcon={<ClearImageInputIcon />}
              onClick={() => {
                setValue(`${name}.explanationImage.data.file`, null);
                setValue(`${name}.explanationImage.preview`, undefined);
              }}
              disabled={explanationImageUrl == null}
            >
              {'Remove'}
            </Button>
          </Stack>
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
                          <InfoIcon />
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
