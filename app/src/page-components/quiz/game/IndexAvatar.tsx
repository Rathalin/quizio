import { Avatar, AvatarProps, Typography, useTheme } from '@mui/material';

type IndexAvatarProps = AvatarProps & {
  index: number;
  color?: string;
};

export default function IndexAvatar({
  index,
  color,
  sx: { ...sxOther } = {},
  ...other
}: IndexAvatarProps) {
  const theme = useTheme();

  return (
    <Avatar
      sx={{
        backgroundColor: color ?? theme.palette.secondary.main,
        width: '2rem',
        height: '2rem',
        ...sxOther,
      }}
      {...other}
    >
      <Typography sx={{ fontWeight: 700 }}>{index}</Typography>
    </Avatar>
  );
}
