import LinkButton from '@/components/LinkButton';
import { Box, Button } from '@mui/material';
import Link from 'next/link';

export default function Home() {
  return (
    <Box sx={{ marginTop: 4 }}>
      <LinkButton
        hrefObserver="/create/1-general"
        navigateOnClick
        iconSide="right"
        variant="contained"
      >
        Create a new quiz
      </LinkButton>
    </Box>
  );
}
