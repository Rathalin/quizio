import QuizioTextField from '@/components/inputs/QuizioTextField';
import { QuizCreateFormFields } from '@/pages/quiz/create/index.page';
import { Box, Button, Stack } from '@mui/material';
import { Controller, useFormContext } from 'react-hook-form';

export default function OverviewForm() {
  const {
    control,
    register,
    formState: { errors },
    getValues,
    watch,
  } = useFormContext<QuizCreateFormFields>();

  const titleMaxLength = 50;
  let titleError: string | null = null;
  if (errors.title?.type === 'required') {
    titleError = 'Title is required';
  }

  const descMaxLength = 100;

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
                  inputProps={{ maxLength: titleMaxLength }}
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
                    maxLength: descMaxLength,
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
              <>
                <input
                  id="image"
                  type="file"
                  accept="image/*"
                  style={{ display: 'none' }}
                  {...field}
                />
                <label
                  htmlFor="image"
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
                    {field.value
                      ? getFileNameFromPath(field.value)
                      : 'Upload Image'}
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
