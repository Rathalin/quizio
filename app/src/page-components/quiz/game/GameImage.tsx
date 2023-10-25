import { Backdrop, Stack, Typography } from '@mui/material';
import Image from 'next/image';
import { useState } from 'react';
import { imageStyle } from './imageStyle';
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

  return (
    <>
      <Image
        src={src}
        alt={`Question image`}
        width={width}
        height={height}
        style={{
          ...imageStyle,
          cursor: 'pointer',
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
        <Stack alignItems="center" justifyContent="center" gap={2}>
          <Image
            src={src}
            alt={alt}
            width={600}
            height={400}
            style={{
              aspectRatio: 'auto 3 / 2',
              height: '90%',
              width: '90%',
              objectFit: 'contain',
            }}
            unoptimized
          />
          <Typography>Click to close.</Typography>
        </Stack>
      </Backdrop>
    </>
  );
}
