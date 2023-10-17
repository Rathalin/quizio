import QuizioTextField from '@/components/inputs/QuizioTextField';
import {
  Box,
  Button,
  Card,
  CardActions,
  CardContent,
  Stack,
} from '@mui/material';
import { Controller, FormProvider, useForm } from 'react-hook-form';
import { constraints } from '@/content-type-utilities/content-type-constraints';
import { QuizOverviewForm, quizOverviewFormSchema } from '../quiz-form-schema';
import { zodResolver } from '@hookform/resolvers/zod';
import BackButton from './BackButton';
import NextButton from './NextButton';
import { useCallback, useEffect, useMemo } from 'react';
import { storageKeys } from '@/persistence/storage-keys';
import { DevTool } from '@hookform/devtools';
import Image from 'next/image';
import { isBrowser } from '@/utilities/isBrowser';
import { ClearImageInputIcon } from './ClearImageInputIcon';
import { useOverviewImageInputDimensions } from './useImageInputDimensions';

type OverviewFormProps = {
  defaultData: QuizOverviewForm;
  onSubmit: (data: QuizOverviewForm) => void;
  backLabel: string | null;
  nextLabel: string | null;
  editMode: boolean;
};

export default function OverviewForm({
  defaultData,
  onSubmit,
  backLabel,
  nextLabel,
  editMode,
}: OverviewFormProps) {
  const { width: imageWidth, height: imageHeight } =
    useOverviewImageInputDimensions();
  const methods = useForm<QuizOverviewForm>({
    defaultValues: defaultData,
    //@ts-ignore
    resolver: zodResolver(quizOverviewFormSchema),
  });
  const {
    control,
    formState: { errors },
    setValue,
    reset,
    watch,
    handleSubmit,
    getValues,
  } = methods;

  const getStorageItem = useCallback((): QuizOverviewForm | null => {
    if (!isBrowser()) return null;
    try {
      return JSON.parse(
        localStorage.getItem(storageKeys.quizOverviewDraft) ?? ''
      ) as QuizOverviewForm | null;
    } catch (error) {
      return null;
    }
  }, []);

  const setStorageItem = useCallback((value: QuizOverviewForm) => {
    if (isBrowser()) {
      localStorage.setItem(
        storageKeys.quizOverviewDraft,
        JSON.stringify(value)
      );
    }
  }, []);

  useEffect(() => {
    if (editMode) return;
    // Keep image from form data
    const image = getValues('image');
    const storageData = getStorageItem();
    if (storageData != null && image != null) {
      storageData.image = image;
    }
    reset(storageData as QuizOverviewForm);
  }, [editMode, getStorageItem, getValues, reset]);

  useEffect(() => {
    if (editMode) return;
    const subscription = watch((value) => {
      const valueToStore = structuredClone(value);
      // Don't store image
      if (valueToStore.image?.data?.file != null) {
        valueToStore.image.data.file = null;
      }
      setStorageItem(valueToStore as QuizOverviewForm);
    });
    return () => subscription.unsubscribe();
  }, [editMode, getValues, setStorageItem, watch]);

  useEffect(() => {
    if (!editMode) return;
    reset(defaultData);
  }, [defaultData, editMode, reset]);

  const imageFile = watch('image.data.file') as File | null;
  const previewImage = watch('image.preview');
  const imageUrl = useMemo(() => {
    if (imageFile != null) {
      return URL.createObjectURL(imageFile);
    }
    return previewImage?.url ?? null;
  }, [imageFile, previewImage]);
  const imageName = useMemo(() => {
    if (imageFile != null) {
      return imageFile?.name?.split('\\').pop()?.split('/').pop();
    }
    return previewImage?.name;
  }, [imageFile, previewImage?.name]);

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
                <Stack alignItems="center" gap={1}>
                  <Controller
                    name="image.data.file"
                    render={({ field }) => (
                      <Box>
                        <input
                          {...field}
                          id="image.data.file"
                          type="file"
                          accept="image/*"
                          style={{ display: 'none' }}
                          value={undefined}
                          onChange={(e) => {
                            setValue(
                              'image.data.file',
                              e.target.files != null ? e.target.files[0] : null
                            );
                          }}
                        />
                        <label
                          htmlFor="image.data.file"
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
                            {imageUrl != null ? (
                              <Stack alignItems="center">
                                <Image
                                  src={imageUrl}
                                  width={imageWidth}
                                  height={imageHeight}
                                  alt="Selected image from input"
                                  style={{
                                    borderRadius: 2,
                                    objectFit: 'cover',
                                  }}
                                  unoptimized
                                />
                                <Box sx={{ overflowWrap: 'anywhere' }}>
                                  {imageName}
                                </Box>
                              </Stack>
                            ) : (
                              <Box>{'Upload Image'}</Box>
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
                      setValue('image.data.file', null);
                      setValue('image.preview', undefined);
                    }}
                    disabled={imageUrl == null}
                  >
                    {'Remove'}
                  </Button>
                </Stack>
              </Stack>
            </Stack>
          </CardContent>
          <CardActions sx={{ padding: 2, justifyContent: 'space-between' }}>
            <BackButton>{backLabel}</BackButton>
            <NextButton>{nextLabel}</NextButton>
          </CardActions>
        </Card>
      </form>
      <DevTool control={control} />
    </FormProvider>
  );
}
