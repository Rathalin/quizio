import { Avatar, useTheme } from '@mui/material';
import Image from 'next/image';

const profileImageDimensions = {
  width: 240,
  height: 240,
};

type AvatarImageProps = {
  imageUrl: string | null;
  username: string;
};

export function AvatarImage({ imageUrl, username }: AvatarImageProps) {
  const theme = useTheme();
  const { width, height } = profileImageDimensions;
  const initials = username?.trim().charAt(0).toUpperCase() ?? '';

  return (
    <>
      {imageUrl == null ? (
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
          <Image
            src={imageUrl}
            alt={`Profile image of ${username}.`}
            width={width}
            height={height}
            unoptimized
          />
        </Avatar>
      )}
    </>
  );
}
