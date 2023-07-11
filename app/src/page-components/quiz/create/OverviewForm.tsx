import QuizioTextField from '@/components/inputs/QuizioTextField';
import { constraints } from '@/persistence/content-type-constraints';
import { Box, Button, Stack } from '@mui/material';
import { Controller, useFormContext } from 'react-hook-form';
import { QuizForm } from './quiz-form-data';
import Image from 'next/image';
import { useIsMobile } from '@/custom-hooks/useIsMobile';

const imageInput = {
  width: 300,
  height: 200,
} as const;

export default function OverviewForm() {
  const {
    control,
    formState: { errors },
    setValue,
    watch,
  } = useFormContext<QuizForm>();
  const isMobile = useIsMobile();

  let titleError: string | null = null;
  if (errors.title?.type === 'required') {
    titleError = 'Title is required';
  }

  function getFileNameFromPath(path: string) {
    return path.split('\\').pop()?.split('/').pop();
  }

  const image = watch('image');
  const previewImageUrl = image != null ? URL.createObjectURL(image) : null;
  const imageWidth = isMobile ? imageInput.width * 0.8 : imageInput.width;
  const imageHeight = isMobile ? imageInput.height * 0.8 : imageInput.height;

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
                      padding: 2,
                      width: imageWidth,
                      minHeight: imageHeight,
                    }}
                  >
                    {previewImageUrl != null ? (
                      <Stack alignItems="center">
                        <Image
                          src={previewImageUrl}
                          width={imageWidth - 34}
                          height={imageHeight - 64}
                          alt="quiz-image"
                          style={{ borderRadius: 2, objectFit: 'cover' }}
                        />
                        <Box sx={{ overflowWrap: 'anywhere' }}>
                          {getFileNameFromPath(image!.name)}
                        </Box>
                      </Stack>
                    ) : (
                      <Box>Upload Image</Box>
                    )}
                  </Button>
                </label>
              </Box>
            )}
            control={control}
          />
        </Stack>
      </Stack>
    </Box>
  );
}
