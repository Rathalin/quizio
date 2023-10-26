import { useIsMobile } from '@/custom-hooks/useIsMobile';
import {
  Stack,
  Tooltip,
  Typography,
  Box,
} from '@mui/material';

type MyProfileProps = {
  email: string;
  role: string;
};

export default function MyProfile({ email, role }: MyProfileProps) {
  const isMobile = useIsMobile();

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
      </Stack>
    </Box>
  );
}
