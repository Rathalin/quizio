import LinkButton from '@/components/LinkButton';
import { getMessages } from '@/utilities/getMessages';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import { useColorScheme } from '@mui/material/styles';
import Typography from '@mui/material/Typography';
import { GetStaticProps } from 'next';
import { useTranslations } from 'next-intl';
import Image from 'next/image';

export const getStaticProps: GetStaticProps = async (ctx) => {
  const messages = await getMessages(ctx.locale, []);

  return {
    props: {
      messages,
    },
  };
};

export default function NotFoundPage() {
  const t = useTranslations('common');
  const { mode } = useColorScheme();

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
        <Typography variant="h1">{t('error.404.title')}</Typography>
        <Box sx={{ marginBottom: 4 }}>
          <Image
            src="/images/Cute-Cat.jpg"
            alt="Cat chewing on wire"
            width={300}
            height={300}
            style={{
              borderRadius: 2,
              objectFit: 'cover',
              filter: mode === 'dark' ? 'brightness(0.8)' : 'none',
            }}
          />
        </Box>
        <LinkButton hrefObserver="/" navigateOnClick variant="contained">
          {t('button.toDashboard.label')}
        </LinkButton>
      </Stack>
    </Box>
  );
}
