import QuizioTextField from '@/components/inputs/QuizioTextField';
import { constraints } from '@/persistence/content-type-constraints';
import { Box, Button, Stack, Tooltip } from '@mui/material';
import { Controller, useFormContext } from 'react-hook-form';
import { QuizForm } from './quiz-form-data';

export default function OverviewForm() {
  const {
    control,
    register,
    formState: { errors },
    getValues,
    watch,
  } = useFormContext<QuizForm>();

  let titleError: string | null = null;
  if (errors.title?.type === 'required') {
    titleError = 'Title is required';
  }

  function getFileNameFromPath(path: string) {
    return path.split('\\').pop()?.split('/').pop();
  }

  const {} = register('title');

  return (
    <Box>
      <Stack direction="column" gap={2} flexWrap="wrap">
        <Stack direction="column" gap={2} sx={{ flexGrow: 1 }}>
          <Box>
            <Controller
              name="title"
              render={({ field }) => (
                <QuizioTextField
                  id="title"
                  label="Title"
                  fullWidth
                  error={errors.title != null}
                  helperText={titleError}
                  inputProps={{ maxLength: constraints.quiz.title.maxLength }}
                  {...field}
                />
              )}
              rules={{ required: true }}
              control={control}
            />
          </Box>
          <Box>
            <Controller
              name="description"
              render={({ field }) => (
                <QuizioTextField
                  id="description"
                  label="Description"
                  inputProps={{
                    maxLength: constraints.quiz.description.maxLength,
                  }}
                  multiline
                  fullWidth
                  {...field}
                />
              )}
              control={control}
            />
          </Box>
        </Stack>
        <Stack direction="row" alignItems="center">
          <Controller
            control={control}
            name="image"
            render={({ field }) => (
              <Tooltip title="Image upload comming soon!" arrow>
                <Box>
                  <input
                    id="quiz-image"
                    type="file"
                    accept="image/*"
                    style={{ display: 'none' }}
                    disabled
                    {...field}
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
                      disabled
                    >
                      {field.value
                        ? getFileNameFromPath(field.value)
                        : 'Upload Image'}
                    </Button>
                  </label>
                </Box>
              </Tooltip>
            )}
          />
        </Stack>
      </Stack>
    </Box>
  );
}
