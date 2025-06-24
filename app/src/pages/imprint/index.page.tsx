import { QuizioBreadcrumbs } from '@/components/breadcrumbs/QuizioBreadcrumbs';
import GradientText from '@/components/GradientText';
import { getMessages } from '@/utilities/getMessages';
import { quizioTitle } from '@/utilities/quizioTitle';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { GetStaticProps, InferGetStaticPropsType } from 'next';
import { useTranslations } from 'next-intl';
import Head from 'next/head';
import Link from 'next/link';
import { canonicalUrl, SeoMeta } from '../../../types/seo';

export const getStaticProps: GetStaticProps<SeoMeta> = async (ctx) => {
  const messages = await getMessages(ctx.locale, ['imprint']);

  return {
    props: {
      messages,
      canonicalUrl: canonicalUrl('/imprint', ctx.locale),
    },
  };
};

export default function ImprintPage({ canonicalUrl }: InferGetStaticPropsType<typeof getStaticProps>) {
  const t = useTranslations();

  return (
    <>
      <Head>
        <title>{quizioTitle(t('imprint.meta.title'))}</title>
        <meta name="description">{t('imprint.meta.description')}</meta>
        <meta property="og:title" content={t('imprint.meta.title')} />
        <link rel="canonical" href={canonicalUrl} />
        <meta property="og:description" content={t('imprint.meta.description')} />
        <meta property="og:image" content="public/favicion" />
      </Head>
      <Box>
        <QuizioBreadcrumbs>
          <Link href="/imprint">{t('imprint.breadcrumbs.current')}</Link>
        </QuizioBreadcrumbs>
        <Typography variant="h1" sx={{ marginTop: 2, marginBottom: 4 }}>
          <GradientText>{t('imprint.title')}</GradientText>
        </Typography>
        <Typography variant="h5" component="p" sx={{ marginBlock: 2 }}>
          {t('imprint.fullname')}
        </Typography>
        <Typography>{t('imprint.address')}</Typography>
        <Typography>{t('imprint.country')}</Typography>
        <Typography variant="h6" component="p" sx={{ marginTop: 2 }}>
          <Link href={`mailto:${t('common.email')}`}>{t('common.email')}</Link>
        </Typography>
        <Typography variant="body2" sx={{ marginTop: 6 }}>
          {t('imprint.disclaimer')}
        </Typography>
      </Box>
    </>
  );
}
