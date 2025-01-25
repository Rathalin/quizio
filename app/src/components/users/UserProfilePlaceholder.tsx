import Stack from '@mui/material/Stack';
import PlaceholderTypography from '../placeholders/PlaceholderTypography';
import PlaceholderBox from '../placeholders/PlaceholderBox';
import { profileImageDimensions } from './ProfileAvatar';

export default function UserProfilePlaceholder() {
  const { width, height } = profileImageDimensions;
  return (
    <>
      <Stack direction="row" sx={{ marginBottom: 2 }}>
        <PlaceholderBox minWidth={`${width}px`} minHeight={`${height}px`} />
      </Stack>
      <Stack alignItems="start" gap={1}>
        <PlaceholderTypography variant="h1" text="Excepteur dolore." sx={{ marginBlock: 0 }} />
        <PlaceholderTypography text="Excepteur dolore nostrud." />
        <PlaceholderTypography text="Qui non sint duis quis tempor voluptate nisi dolore nostrud." />
      </Stack>
    </>
  );
}
