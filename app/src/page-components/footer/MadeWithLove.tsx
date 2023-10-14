import { Stack, Box } from '@mui/material';
import FavoriteRoundedIcon from '@mui/icons-material/FavoriteRounded';

export default function MadeWithLove() {
  return (
    <Stack direction="row" alignItems="center" columnGap={1} flexWrap="wrap">
      <Box component="span">{'Made with '}</Box>
      <FavoriteRoundedIcon color="error" className="heart" />
      <Box component="span">{' by Daniel Flockert'}</Box>
    </Stack>
  );
}
