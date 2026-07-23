import Stack from '@mui/material/Stack';
import { useTranslations } from 'next-intl';
import Link from 'next/link';

export default function Legal() {
  const t = useTranslations('footer');

  return (
    <Stack direction="row" sx={{ alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
      <Link href="/imprint" className="link">
        {t('imprint')}
      </Link>
    </Stack>
  );
}
