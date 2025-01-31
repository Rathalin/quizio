import FavoriteRoundedIcon from '@mui/icons-material/FavoriteRounded';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import { useTranslations } from 'next-intl';

export default function MadeWithLove() {
  const t = useTranslations('footer');

  return (
    <Stack direction="row" alignItems="center" columnGap={1} flexWrap="wrap">
      <Box component="span">{t('madeWithLove.part1')}</Box>
      <FavoriteRoundedIcon color="error" className="heart" />
      <Box component="span">{t('madeWithLove.part2')}</Box>
    </Stack>
  );
}
