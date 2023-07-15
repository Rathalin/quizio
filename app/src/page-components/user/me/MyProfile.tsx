import { useIsMobile } from '@/custom-hooks/useIsMobile';
import {
  Stack,
  Tooltip,
  Typography,
  Avatar,
  useTheme,
  Box,
} from '@mui/material';

type MyProfileProps = {
  username: string;
  email: string;
  role: string;
};

export default function MyProfile({ username, email, role }: MyProfileProps) {
  const theme = useTheme();
  const isMobile = useIsMobile();

  const initials = username?.trim().charAt(0).toUpperCase() ?? '';

  return (
    <Box>
      <Stack
        direction="row"
        justifyContent="space-between"
        flexWrap="wrap"
        gap={4}
      >
        <Stack spacing={1} alignItems="start">
          <Tooltip
            title="Your username"
            placement={isMobile ? 'bottom' : 'right'}
            arrow
          >
            <Typography variant="h4" component="h2">
              {username}
            </Typography>
          </Tooltip>
          <Tooltip
            title="Your email address"
            placement={isMobile ? 'bottom' : 'right'}
            arrow
          >
            <Typography>{email}</Typography>
          </Tooltip>
          <Tooltip
            title="Your role"
            placement={isMobile ? 'bottom' : 'right'}
            arrow
          >
            <Typography>{role}</Typography>
          </Tooltip>
        </Stack>
        <Stack alignItems="center" spacing={1}>
          <Avatar
            variant="rounded"
            sx={{
              backgroundColor: theme.palette.primary.dark,
              fontWeight: 'bold',
              width: '6rem',
              height: '6rem',
              fontSize: '2rem',
              color: theme.palette.primary.contrastText,
            }}
          >
            {initials}
          </Avatar>
          <Typography>Profile image comming soon.</Typography>
        </Stack>
      </Stack>
      {/* <Divider sx={{ marginBlock: 2 }} />
      <Box>
        <Typography>This is your prive profile.</Typography>
        <LinkButton
          hrefObserver={`/users/${uuid}`}
          navigateOnClick
          variant="contained"
        >
          View your public profile
        </LinkButton>
      </Box> */}
    </Box>
  );
}
