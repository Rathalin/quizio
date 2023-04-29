import GradientWord from '@/components/GradientWord';
import LinkButton from '@/components/LinkButton';
import { Box, Button, Typography } from '@mui/material';
import Link from 'next/link';

export default function Home() {
  return (
    <Box>
      <Typography
        component="h1"
        sx={{
          fontSize: '4rem',
          marginBlock: 4,
          display: 'flex',
          justifyContent: 'center',
        }}
      >
        <GradientWord>Quizio</GradientWord>
      </Typography>
      <Box
        sx={{
          marginTop: 4,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <LinkButton
          hrefObserver="/create/1-general"
          navigateOnClick
          iconSide="right"
          variant="contained"
        >
          Create a new quiz
        </LinkButton>
      </Box>
    </Box>
  );
}
