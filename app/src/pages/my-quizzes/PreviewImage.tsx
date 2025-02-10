import { useColorMode } from '@/page-components/theme.context';
import { theme } from '@/theme';
import { prefixWithBackendUrl } from '@/utilities/urlUtils';
import Box from '@mui/material/Box';
import { darken, lighten } from '@mui/material/styles';
import Image from 'next/image';
import ImageIcon from '@mui/icons-material/Image';
import { useTranslations } from 'next-intl';

type Props = {
  url: string | null;
  width: number;
};

export function PreviewImage({ url, width }: Props) {
  const height = width * (2 / 3);
  const t = useTranslations('myQuizzes.table');
  const { mode } = useColorMode();

  return url != null ? (
    <Image
      src={prefixWithBackendUrl(url)}
      alt={t('column.quiz.image.alt')}
      width={width}
      height={height}
      style={{
        objectFit: 'cover',
        width: width,
        height: height,
        minWidth: width,
        borderRadius: '4px',
      }}
      priority
      unoptimized
    />
  ) : (
    <Box
      sx={{
        width: width,
        height: height,
        minWidth: width,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: '4px',
        backgroundColor:
          mode === 'light' ? lighten(theme.palette.secondary.light, 0.7) : darken(theme.palette.secondary.light, 0.7),
      }}
    >
      <ImageIcon fontSize="large" />
    </Box>
  );
}
