import QuizioTextField from '@/components/inputs/QuizioTextField';
import { constraints } from '@/persistence/content-type-constraints';
import { Box, Button, Stack } from '@mui/material';
import { Controller, useFormContext } from 'react-hook-form';
import { QuizForm } from './quiz-form-data';

export default function OverviewForm({
  image,
  setImage,
}: {
  image: File | null;
  setImage: (image: File | null) => void;
}) {
  const {
    control,
    register,
    formState: { errors },
    getValues,
    watch,
    setValue,
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
          <Box>
            <input
              id="quiz-image"
              type="file"
              accept="image/*"
              style={{ display: 'none' }}
              onChange={(e) => {
                console.log(typeof e.target.files);
                setImage(e.target.files != null ? e.target.files[0] : null);
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
                  padding: 4,
                  minWidth: '16rem',
                  minHeight: '180px',
                }}
              >
                {image?.name ? getFileNameFromPath(image.name) : 'Upload Image'}
              </Button>
            </label>
          </Box>
          {/* <Controller
            control={control}
            name="image"
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
                    console.log(typeof e.target.files);
                    setValue(
                      'image',
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
                      padding: 4,
                      minWidth: '16rem',
                      minHeight: '180px',
                    }}
                  >
                    {field.value?.name
                      ? getFileNameFromPath(field.value.name)
                      : 'Upload Image'}
                  </Button>
                </label>
              </Box>
            )}
          /> */}
        </Stack>
      </Stack>
    </Box>
  );
}
