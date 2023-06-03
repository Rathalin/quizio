import QuizioTextField from '@/components/inputs/QuizioTextField';
import { Box, Button, Stack } from '@mui/material';
import { Controller, useFormContext } from 'react-hook-form';

export default function OverviewForm() {
  const {
    control,
    register,
    formState: { errors },
    getValues,
  } = useFormContext<{
    quizTitle: string;
    quizDesc: string;
    quizImage: string;
  }>();

  const titleMaxLength = 50;
  let titleError = '';
  if (errors.quizTitle?.type === 'required') {
    titleError = 'Title is required';
  }

  const descMaxLength = 100;

  return (
    <Box>
      <Stack direction="column" gap={2} flexWrap="wrap">
        <Stack direction="column" gap={2} sx={{ flexGrow: 1 }}>
          <Box>
            <Controller
              control={control}
              name="quizTitle"
              render={({ field }) => (
                <QuizioTextField
                  id="quiz-title"
                  label="Title"
                  error={errors.quizTitle != null}
                  helperText={titleError}
                  inputProps={{ maxLength: titleMaxLength }}
                  required
                  fullWidth
                  {...field}
                />
              )}
              rules={{ required: true }}
            />
          </Box>
          <Box>
            <Controller
              control={control}
              name="quizDesc"
              render={({ field }) => (
                <QuizioTextField
                  id="quiz-desc"
                  label="Description"
                  inputProps={{
                    maxLength: descMaxLength,
                  }}
                  multiline
                  fullWidth
                  {...field}
                />
              )}
            />
          </Box>
        </Stack>
        <Stack direction="row" alignItems="center">
          <Controller
            control={control}
            name="quizImage"
            render={({ field }) => (
              <>
                <input
                  id="quiz-image"
                  type="file"
                  accept="image/*"
                  style={{ display: 'none' }}
                  {...register('quizImage')}
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
                      padding: 4,
                      minWidth: '16rem',
                      minHeight: '180px',
                    }}
                  >
                    Upload image
                  </Button>
                </label>
              </>
            )}
          />
        </Stack>
      </Stack>
    </Box>
  );
}
