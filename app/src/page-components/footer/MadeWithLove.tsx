import { FavoriteRounded } from '@mui/icons-material';
import { Stack, Box } from '@mui/material';

export default function MadeWithLove() {
  return (
    <Stack direction="row" alignItems="center" columnGap={1} flexWrap="wrap">
      <Box component="span">{'Made with '}</Box>
      <FavoriteRounded color="error" className="heart" />
      <Box component="span">{' by Daniel Flockert'}</Box>
    </Stack>
  );
}
