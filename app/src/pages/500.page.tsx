import LinkButton from '@/components/LinkButton';
import { useColorMode } from '@/page-components/theme.context';
import { Box, Stack, Typography } from '@mui/material';
import Image from 'next/image';
import Link from 'next/link';

export default function InternalServerErrorPage() {
  const { mode } = useColorMode();

  return (
    <Box
      sx={{
        height: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <Stack alignItems="center">
        <Typography variant="h1">Something broke.</Typography>
        <Box sx={{ marginBottom: 4 }}>
          <Image
            src="/images/CatChewingOnWire.jpg"
            alt="Cat chewing on wire"
            width={300}
            height={200}
            style={{
              borderRadius: 2,
              objectFit: 'cover',
              filter: mode === 'dark' ? 'brightness(0.8)' : 'none',
            }}
          />
        </Box>
        <Typography sx={{ marginBottom: 4 }}>
          <span>{'Please contact '}</span>
          <Link href="mailto:daniel@flockert">daniel@flockert.at</Link>
          <span>{', if the error persists.'}</span>
        </Typography>
        <LinkButton
          hrefObserver="/"
          navigateOnClick
          variant="contained"
          iconSide="left"
        >
          Home
        </LinkButton>
      </Stack>
    </Box>
  );
}
