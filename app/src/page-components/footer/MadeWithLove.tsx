import FavoriteRoundedIcon from '@mui/icons-material/FavoriteRounded';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';

export default function MadeWithLove() {
  return (
    <Stack direction="row" alignItems="center" columnGap={1} flexWrap="wrap">
      <Box component="span">{'Made with '}</Box>
      <FavoriteRoundedIcon color="error" className="heart" />
      <Box component="span">{' by Daniel Flockert'}</Box>
    </Stack>
  );
}
