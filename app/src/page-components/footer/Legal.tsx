import { Stack } from '@mui/material';
import Link from 'next/link';

export default function Legal() {
  return (
    <Stack direction="row" alignItems="center" gap={2} flexWrap="wrap">
      <Link href="/imprint" className="link">
        {'Imprint'}
      </Link>
    </Stack>
  );
}
