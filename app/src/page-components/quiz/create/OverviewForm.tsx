import QuizioTextField from '@/components/inputs/QuizioTextField';
import {
  Alert,
  Box,
  Button,
  Card,
  CardActions,
  CardContent,
  Stack,
} from '@mui/material';
import { Controller, FormProvider, useForm } from 'react-hook-form';
import Image from 'next/image';
import { useIsMobile } from '@/custom-hooks/useIsMobile';
import { constraints } from '@/content-type-utilities/content-type-constraints';
import { QuizOverviewForm, quizOverviewFormSchema } from '../quiz-form-schema';
import { zodResolver } from '@hookform/resolvers/zod';
import BackButton from './BackButton';
import NextButton from './NextButton';
import { useEffect } from 'react';
import { useStorage } from '@/custom-hooks/useStorage';
import { storageKeys } from '@/persistence/storage-keys';

const imageInput = {
  width: 300,
  height: 200,
} as const;

type OverviewFormProps = {
  tempDisableImageInput?: boolean;
  defaultData: QuizOverviewForm;
  onSubmit: (data: QuizOverviewForm) => void;
  backLabel: string | null;
  nextLabel: string | null;
  editMode: boolean;
};

export default function OverviewForm({
  tempDisableImageInput = false,
  defaultData,
  onSubmit,
  backLabel,
  nextLabel,
  editMode,
}: OverviewFormProps) {
  const isMobile = useIsMobile();
  const methods = useForm<QuizOverviewForm>({
    defaultValues: defaultData,
    resolver: zodResolver(quizOverviewFormSchema),
  });
  const {
    control,
    formState: { errors },
    setValue,
    reset,
    watch,
    handleSubmit,
  } = methods;

  const { getStorageItem, setStorageItem } = useStorage<QuizOverviewForm>(
    storageKeys.quizOverviewDraft
  );
  useEffect(() => {
    if (editMode) return;
    reset(getStorageItem() as QuizOverviewForm);
  }, [editMode, getStorageItem, reset]);
  useEffect(() => {
    if (editMode) return;
    const subscription = watch((value) => {
      // Don't store image
      delete value.image;
      setStorageItem(value as QuizOverviewForm);
    });
    return () => subscription.unsubscribe();
  }, [editMode, setStorageItem, watch]);

  useEffect(() => {
    if (!editMode) return;
    reset(defaultData);
  }, [defaultData, editMode, reset]);

  const image = watch('image');
  const previewImageUrl = image != null ? URL.createObjectURL(image) : null;
  const imageWidth = isMobile ? imageInput.width * 0.8 : imageInput.width;
  const imageHeight = isMobile ? imageInput.height * 0.8 : imageInput.height;

  function getFileNameFromPath(path: string) {
    return path.split('\\').pop()?.split('/').pop();
  }

  function handleFormSubmit(data: QuizOverviewForm) {
    onSubmit(data);
  }

  return (
    <FormProvider {...methods}>
      <form onSubmit={handleSubmit(handleFormSubmit)} noValidate>
        <Card>
          <CardContent>
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
                        helperText={errors.title?.message?.toString() ?? ''}
                        inputProps={{
                          maxLength: constraints.quiz.title.maxLength,
                        }}
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
              <Stack direction="column" alignItems="start" gap={1}>
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
                        disabled={tempDisableImageInput}
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
                          disabled={tempDisableImageInput}
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
                {tempDisableImageInput && (
                  <Alert severity="warning">
                    Changing the image is not supported yet 😕
                  </Alert>
                )}
              </Stack>
            </Stack>
          </CardContent>
          <CardActions sx={{ padding: 2, justifyContent: 'space-between' }}>
            <BackButton>{backLabel}</BackButton>
            <NextButton>{nextLabel}</NextButton>
          </CardActions>
        </Card>
      </form>
    </FormProvider>
  );
}
