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
import { useImageInputDimensions } from '../useImageInputDimensions';
import { useMemo } from 'react';
import Image from 'next/image';

type QuestionInputProps = {
  deletable: boolean;
  onDelete: () => void;
  expanded: boolean;
  onExpand: () => void;
  previewImage?: {
    url: string;
    name: string;
  };
  onRemoveImage?: () => void;
};

export default function QuestionInput({
  deletable,
  onDelete,
  expanded,
  onExpand,
  previewImage,
  onRemoveImage,
}: QuestionInputProps) {
  const theme = useTheme();
  const index = useQuestionIndex();
  const { width: imageWidth, height: imageHeight } = useImageInputDimensions();
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

  const imageFile = watch(`${name}.questionImage.file`) as File | null;
  const imageUrl = useMemo(() => {
    if (imageFile != null) {
      return URL.createObjectURL(imageFile);
    }
    return previewImage?.url ?? null;
  }, [imageFile, previewImage?.url]);
  const imageName = useMemo(() => {
    if (imageFile != null) {
      return imageFile?.name?.split('\\').pop()?.split('/').pop();
    }
    return previewImage?.name;
  }, [imageFile, previewImage?.name]);

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
        <Stack
          display="inline-flex"
          alignItems="center"
          gap={1}
          sx={{ marginBottom: 4 }}
        >
          <Controller
            name={`${name}.questionImage.file`}
            render={({ field }) => (
              <Box>
                <input
                  {...field}
                  id="quiz-image"
                  type="file"
                  accept="image/*"
                  style={{ display: 'none' }}
                  value={undefined}
                  onChange={(e) => {
                    setValue(
                      `${name}.questionImage.file`,
                      e.target.files != null ? e.target.files[0] : null
                    );
                  }}
                />
                <label
                  htmlFor="quiz-image"
                  style={{
                    display: 'flex',
                  }}
                >
                  <Button
                    variant="outlined"
                    component="span"
                    sx={{
                      padding: 2,
                      width: imageWidth,
                      minHeight: imageHeight,
                    }}
                  >
                    {imageUrl != null ? (
                      <Stack alignItems="center">
                        <Image
                          src={imageUrl}
                          width={imageWidth - 34}
                          height={imageHeight - 64}
                          alt="quiz-image"
                          style={{
                            borderRadius: 2,
                            objectFit: 'cover',
                          }}
                          unoptimized
                        />
                        <Box sx={{ overflowWrap: 'anywhere' }}>{imageName}</Box>
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
              setValue(`${name}.questionImage.file`, null);
              if (onRemoveImage != null) {
                onRemoveImage();
              }
            }}
            disabled={imageUrl == null}
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
