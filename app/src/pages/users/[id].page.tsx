import { Box } from '@mui/material';
import { useRouter } from 'next/router';

export default function UserIdPage() {
  const router = useRouter();

  const userId = router.query.id;

  return <Box>{userId}</Box>;
}
