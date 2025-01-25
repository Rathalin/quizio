import { ClearImageInputIcon } from '@/components/ClearImageInputIcon';
import { zodResolver } from '@hookform/resolvers/zod';
import { SaveOutlined } from '@mui/icons-material';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import Image from 'next/image';
import { useMemo } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { z } from 'zod';

export const profileImageDimensions = {
  width: 240,
  height: 240,
};

const profileImageFormSchema = z.object({
  image: z.object({
    data: z.object({
      file: z.any().nullable(),
    }),
    preview: z
      .object({
        url: z.string(),
      })
      .optional(),
  }),
});
type ProfileImageForm = z.infer<typeof profileImageFormSchema>;
const defaultFormData: ProfileImageForm = {
  image: {
    data: {},
  },
};

type AvatarImageProps = {
  imageUrl: string | null;
  username: string;
};

export function ProfileAvatar({ imageUrl, username }: AvatarImageProps) {
  const { width, height } = profileImageDimensions;
  const { control, handleSubmit, setValue, watch } = useForm({
    defaultValues: defaultFormData,
    resolver: zodResolver(profileImageFormSchema),
  });

  const profileImageFile = watch('image.data.file') as File | null;
  const profilePreviewImage = watch('image.preview');
  const profileImageUrl = useMemo(() => {
    if (profileImageFile != null) {
      return URL.createObjectURL(profileImageFile);
    }
    return profilePreviewImage?.url ?? null;
  }, [profileImageFile, profilePreviewImage]);

  function handleFormSubmit(data: ProfileImageForm) {
    // TODO Call mutation
  }

  return (
    <>
      {/* {imageUrl == null ? (
        <Avatar
          variant="rounded"
          sx={{
            backgroundColor: theme.palette.primary.main,
            fontWeight: 'bold',
            width,
            height,
            fontSize: '4rem',
            color: theme.palette.primary.contrastText,
          }}
        >
          {initials}
        </Avatar>
      ) : (
        <Avatar
          variant="rounded"
          sx={{
            backgroundColor: theme.palette.primary.main,
            width,
            height,
          }}
        >
          <Image src={imageUrl} alt={`Profile image of ${username}.`} width={width} height={height} unoptimized />
        </Avatar>
      )} */}
      <form onSubmit={handleSubmit(handleFormSubmit)} noValidate>
        <Stack display="inline-flex" alignItems="center" gap={1} sx={{ marginBottom: 4 }}>
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
                    setValue('image.data.file', e.target.files != null ? e.target.files[0] : null);
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
                      minWidth: width + 2 * 1, // Account for button border width
                      minHeight: height + 2 * 1,
                    }}
                  >
                    {profileImageUrl != null ? (
                      <Stack alignItems="center">
                        <Image
                          src={profileImageUrl}
                          width={width}
                          height={height}
                          alt={'image.data.file input'}
                          style={{
                            borderRadius: 2,
                            objectFit: 'cover',
                            margin: '-17px',
                          }}
                          unoptimized
                        />
                      </Stack>
                    ) : (
                      <Box>{'Upload profile image'}</Box>
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
            disabled={profileImageUrl == null}
          >
            {'Remove'}
          </Button>
          <Button variant="outlined" disabled={profileImageUrl == null} startIcon={<SaveOutlined />}>
            {'Save profile image'}
          </Button>
        </Stack>
      </form>
    </>
  );
}
