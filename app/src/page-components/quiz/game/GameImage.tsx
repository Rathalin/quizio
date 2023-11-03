import { Backdrop, Stack, Typography } from '@mui/material';
import Image from 'next/image';
import { useState } from 'react';
import { useImageDimensions } from './useImageDimensions';
import { useColorMode } from '@/page-components/theme.context';

type GameImageProps = {
  src: string;
  alt: string;
};

export function GameImage({ src, alt }: GameImageProps) {
  const { mode } = useColorMode();
  const { width, height } = useImageDimensions();
  const [open, setOpen] = useState(false);
  const dropShadowFilter = `drop-shadow(3px 3px 8px #7d7d7d)`;

  return (
    <>
      <Image
        src={src}
        alt={`Question image`}
        width={width}
        height={height}
        style={{
          objectFit: 'cover',
          borderRadius: '4px',
          cursor: 'pointer',
          filter: dropShadowFilter,
        }}
        onClick={() => setOpen(true)}
        unoptimized
      />
      <Backdrop
        open={open}
        onClick={() => setOpen(false)}
        sx={{
          backgroundColor: mode === 'dark' ? '#000000e6' : '#ffffffe6',
          zIndex: (theme) => theme.zIndex.drawer + 1,
          cursor: 'pointer',
        }}
      >
        <Stack
          alignItems="center"
          justifyContent="center"
          gap={2}
          sx={{
            padding: {
              xs: 2,
              sm: 4,
            },
            height: '100%',
            width: '100%',
          }}
        >
          <Image
            src={src}
            alt={alt}
            width={600}
            height={400}
            style={{
              height: '90%',
              width: '100%',
              objectFit: 'contain',
              aspectRatio: 'auto 3 / 2',
              filter: dropShadowFilter,
            }}
            unoptimized
          />
          <Typography>Click to close.</Typography>
        </Stack>
      </Backdrop>
    </>
  );
}
