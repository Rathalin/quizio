import LinkButton from '@/components/LinkButton';
import { getMessages } from '@/utilities/getMessages';
import { quizioTitle } from '@/utilities/quizioTitle';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import { useColorScheme } from '@mui/material/styles';
import Typography from '@mui/material/Typography';
import { GetStaticProps } from 'next';
import { useTranslations } from 'next-intl';
import Head from 'next/head';
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
    <>
      <Head>
        <title>{quizioTitle(t('error.404.meta.title'))}</title>
      </Head>
      <Box
        sx={{
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Stack sx={{ alignItems: 'center' }}>
          <Typography color="secondary" variant="h3" component="p" sx={{ marginTop: 4, marginBottom: 0 }}>
            {t('error.404.eyebrow')}
          </Typography>
          <Typography variant="h1" sx={{ marginTop: 2, marginBottom: 4 }}>
            {t('error.404.title')}
          </Typography>
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
    </>
  );
}
