import Image, { ImageProps } from 'next/image';

type LogoProps = Omit<ImageProps, 'src' | 'alt'> & {};

export default function Logo({
  width = 30,
  height = 30 * 1.32,
  ...props
}: LogoProps) {
  return (
    <Image
      src="/quizio-logo.png"
      alt="Quizio Logo"
      width={width}
      height={height}
      {...props}
    />
  );
}
