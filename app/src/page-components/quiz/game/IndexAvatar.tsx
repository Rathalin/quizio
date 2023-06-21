import { Avatar, Typography, useTheme } from '@mui/material';

type IndexAvatarProps = {
  index: number;
  color?: string;
};

export default function IndexAvatar({ index, color }: IndexAvatarProps) {
  const theme = useTheme();

  return (
    <Avatar
      sx={{
        backgroundColor: color ?? theme.palette.secondary.main,
        width: '2rem',
        height: '2rem',
      }}
    >
      <Typography sx={{ fontWeight: 700 }}>{index}</Typography>
    </Avatar>
  );
}
