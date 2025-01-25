import { ClearImageInputIcon } from '@/components/ClearImageInputIcon';
import { getBase64 } from '@/data/getBase64';
import { useDeleteFileMutation } from '@/data/useDeleteFileMutation';
import { useUpdateProfileImageMutation } from '@/data/useUpdateProfileImageMutation';
import { useUploadFileMutation } from '@/data/useUploadFileMutation';
import { useToastStore } from '@/persistence/taost.store';
import { raise } from '@/utilities/errorHandling';
import { getImageName, prefixWithBackendUrl } from '@/utilities/urlUtils';
import { zodResolver } from '@hookform/resolvers/zod';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogTitle from '@mui/material/DialogTitle';
import Stack from '@mui/material/Stack';
import { useSession } from 'next-auth/react';
import Image from 'next/image';
import { useMemo, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { z } from 'zod';

export const profileImageDimensions = {
  width: 240,
  height: 240,
};

const profileImageFormSchema = z.object({
  imageFile: z.any(),
});
type ProfileImageForm = z.infer<typeof profileImageFormSchema>;
const defaultFormData: ProfileImageForm = {
  imageFile: null,
};

export function ProfileAvatar() {
  const { data: session, update: updateSession } = useSession();
  const { showToast } = useToastStore();
  const { width, height } = profileImageDimensions;
  const { control, handleSubmit, setValue, watch } = useForm({
    defaultValues: defaultFormData,
    resolver: zodResolver(profileImageFormSchema),
  });
  const [deleteImageDialogOpen, setDeleteImageDialogOpen] = useState(false);
  const imageUrl = session?.user.profileImageUrl ?? null;

  const { mutateAsync: uploadFile } = useUploadFileMutation();
  const { mutateAsync: deleteFile } = useDeleteFileMutation();
  const { mutateAsync: updateProfileImage } = useUpdateProfileImageMutation();
  const formImageFile = watch('imageFile') as File | null;
  const previewImageUrl = useMemo(() => {
    if (formImageFile != null) {
      return URL.createObjectURL(formImageFile);
    }
    if (imageUrl != null) {
      return prefixWithBackendUrl(imageUrl);
    }
    return null;
  }, [formImageFile, imageUrl]);

  async function handleFormSubmit({ imageFile }: ProfileImageForm) {
    if (session == null) {
      raise('Cannot update user profile when session is null!');
    }
    try {
      let newImageUrl = imageUrl;
      // Delete image
      if (newImageUrl != null) {
        await deleteFile({ filename: getImageName(newImageUrl) });
        newImageUrl = null;
      }
      // Upload image
      if (imageFile != null) {
        const { url } = await uploadFile({
          file: await getBase64(imageFile),
          filename: imageFile.name,
        });
        newImageUrl = url;
      }

      await updateProfileImage({ profileImageUrl: newImageUrl });
      await updateSession({
        ...session.user,
        profileImageUrl: newImageUrl,
      });
      showToast('Profile image updated.', 'success');
    } catch (error) {
      showToast('Could not update profile image!', 'error');
    }
  }

  function handleCloseDialog() {
    setDeleteImageDialogOpen(false);
  }

  function onConfirmDeleteProfileImage() {
    handleSubmit(handleFormSubmit)();
    setDeleteImageDialogOpen(false);
  }

  return (
    <>
      <Dialog open={deleteImageDialogOpen} onClose={handleCloseDialog}>
        <DialogTitle>{'Do you really want to delete your current profile image?'}</DialogTitle>
        <DialogActions>
          <Button onClick={handleCloseDialog}>{'No, cancel'}</Button>
          <Button onClick={onConfirmDeleteProfileImage} color="error" autoFocus>
            {'Yes, delete'}
          </Button>
        </DialogActions>
      </Dialog>
      <form onSubmit={handleSubmit(handleFormSubmit)} noValidate>
        <Stack display="inline-flex" alignItems="center" gap={1} sx={{ marginBottom: 4 }}>
          <Controller
            name="imageFile"
            render={({ field }) => (
              <Box>
                <input
                  {...field}
                  id="imageFile"
                  type="file"
                  accept="image/*"
                  style={{ display: 'none' }}
                  value={''} // Always needs to be empty string (https://developer.mozilla.org/en-US/docs/Web/HTML/Element/input/file#value)
                  onChange={(e) => {
                    const newFile: File | null = e.target.files != null ? (e.target.files[0] ?? null) : null;
                    setValue('imageFile', newFile);
                    if (newFile != null) {
                      handleSubmit(handleFormSubmit)();
                    }
                  }}
                />
                <label
                  htmlFor="imageFile"
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
                    {previewImageUrl != null ? (
                      <Stack alignItems="center">
                        <Image
                          src={previewImageUrl}
                          width={width}
                          height={height}
                          alt={`imageFile of ${session?.user.username}`}
                          style={{
                            borderRadius: 2,
                            objectFit: 'cover',
                            margin: '-1rem',
                          }}
                          unoptimized
                          priority
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
          <Stack direction="column" gap={2} sx={{ marginTop: 2 }}>
            <Button
              variant="outlined"
              color="error"
              startIcon={<ClearImageInputIcon />}
              onClick={() => {
                setValue('imageFile', null);
                setDeleteImageDialogOpen(true);
              }}
              disabled={previewImageUrl == null}
            >
              {'Delete image'}
            </Button>
          </Stack>
        </Stack>
      </form>
    </>
  );
}
