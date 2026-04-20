import { prefixWithBackendUrl } from '@/utilities/urlUtils';
import Avatar from '@mui/material/Avatar';
import { useTheme } from '@mui/material/styles';
import Image from 'next/image';

export const profileImageDimensions = {
  width: 240,
  height: 240,
};

type AvatarImageProps = {
  imageUrl: string | null;
  username: string;
};

export function ProfileAvatar({ imageUrl, username }: AvatarImageProps) {
  const theme = useTheme();
  const { width, height } = profileImageDimensions;
  const initials = username?.trim().charAt(0).toUpperCase() ?? '';

  return (
    <>
      {imageUrl == null ? (
        <Avatar
          variant="rounded"
          sx={{
            backgroundColor: theme.vars?.palette.primary.main,
            fontWeight: 'bold',
            width,
            height,
            fontSize: '4rem',
            color: theme.vars?.palette.primary.contrastText,
          }}
        >
          {initials}
        </Avatar>
      ) : (
        <Avatar
          variant="rounded"
          sx={{
            backgroundColor: theme.vars?.palette.primary.main,
            width,
            height,
          }}
        >
          <Image
            src={prefixWithBackendUrl(imageUrl)}
            alt={`Profile image of ${username}.`}
            width={width}
            height={height}
            style={{ objectFit: 'cover' }}
            unoptimized
          />
        </Avatar>
      )}
    </>
  );
}
