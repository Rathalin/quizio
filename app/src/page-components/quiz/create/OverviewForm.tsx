import { Box, Button, Stack, TextField } from '@mui/material';
import { Controller, useFormContext } from 'react-hook-form';

export default function OverviewForm() {
  const {
    control,
    register,
    formState: { errors },
    getValues,
  } = useFormContext<{
    title: string;
    description: string;
    image: string;
  }>();

  const titleMaxLength = 50;
  let titleError = '';
  if (errors.title?.type === 'required') {
    titleError = 'Title is required';
  }

  const descMaxLength = 100;

  function getFileNameFromPath(path: string) {
    return path.split('\\').pop()?.split('/').pop();
  }

  return (
    <Box>
      <Stack direction="column" gap={2} flexWrap="wrap">
        <Stack direction="column" gap={2} sx={{ flexGrow: 1 }}>
          <Box>
            <Controller
              control={control}
              name="title"
              render={({ field }) => (
                <TextField
                  id="quiz-title"
                  label="Title"
                  error={errors.title != null}
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
            <TextField
              id="quiz-desc"
              label="Description"
              inputProps={{
                maxLength: descMaxLength,
              }}
              multiline
              fullWidth
              {...register('description')}
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
                  id="quiz-image"
                  type="file"
                  accept="image/*"
                  style={{ display: 'none' }}
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
