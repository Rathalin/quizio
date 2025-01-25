import Avatar, { AvatarProps } from '@mui/material/Avatar';
import { useTheme } from '@mui/material/styles';
import Typography from '@mui/material/Typography';

type IndexAvatarProps = AvatarProps & {
  index: number;
  color?: string;
};

export default function IndexAvatar({ index, color, sx: { ...sxOther } = {}, ...other }: IndexAvatarProps) {
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
