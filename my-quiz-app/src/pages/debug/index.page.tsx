import { Box } from '@mui/material';
import { useSession } from 'next-auth/react';

export default function DebugPage() {
  const { data: session } = useSession();
  return <Box>{JSON.stringify(session)}</Box>;
}
