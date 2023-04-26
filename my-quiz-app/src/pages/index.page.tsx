import { Box, Button } from '@mui/material';
import Link from 'next/link';

export default function Home() {
  return (
    <Box sx={{ marginTop: 4 }}>
      <Link href="/create/1-general">
        <Button variant="contained">Create a new quiz</Button>
      </Link>
    </Box>
  );
}
