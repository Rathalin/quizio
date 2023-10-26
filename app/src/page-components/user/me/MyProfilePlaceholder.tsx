import PlaceholderTypography from '@/components/placeholders/PlaceholderTypography';
import UserProfilePlaceholder from '@/components/users/UserProfilePlaceholder';
import { Stack } from '@mui/material';

export default function MyProfilePlaceholder() {
  return (
    <>
      <UserProfilePlaceholder />
      <Stack direction="column" alignItems="start" sx={{ marginTop: 3 }}>
        <PlaceholderTypography text="Qui non sint duis quis tempor." />
        <PlaceholderTypography text="Excepteur dolore." />
      </Stack>
    </>
  );
}
