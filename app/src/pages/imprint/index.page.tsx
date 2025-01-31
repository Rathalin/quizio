import { QuizioBreadcrumbs } from '@/components/breadcrumbs/QuizioBreadcrumbs';
import GradientText from '@/components/GradientText';
import { getMessages } from '@/utilities/getMessages';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { GetStaticProps } from 'next';
import { useTranslations } from 'next-intl';
import Link from 'next/link';

export const getStaticProps: GetStaticProps = async (ctx) => {
  const messages = await getMessages(ctx.locale, ['imprint']);

  return {
    props: {
      messages,
    },
  };
};

export default function ImprintPage() {
  const t = useTranslations('imprint');

  return (
    <Box>
      <QuizioBreadcrumbs>
        <Link href="/imprint">{t('breadcrumbs.current')}</Link>
      </QuizioBreadcrumbs>
      <Typography variant="h1">
        <GradientText>{t('title')}</GradientText>
      </Typography>
      <Typography variant="h5" component="p">
        {t('fullname')}
      </Typography>
      <Typography>{t('address')}</Typography>
      <Typography>{t('country')}</Typography>
      <Typography variant="h6" component="p" sx={{ marginTop: 2 }}>
        <Link href={`mailto:${t('email')}`}>{t('email')}</Link>
      </Typography>
      <Typography variant="body2" sx={{ marginTop: 6 }}>
        {t('disclaimer')}
      </Typography>
    </Box>
  );
}
