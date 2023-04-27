import '@/styles/globals.css';
import { CssBaseline, ThemeProvider } from '@mui/material';
import type { AppProps } from 'next/app';
import { theme } from '../../theme';
import Layout from '../page-components/Layout';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { useEffect } from 'react';
import { usePageTransition } from '@/stores/page-transition.store';

export default function App({ Component, pageProps }: AppProps) {
  const router = useRouter();
  const { startTransitioning, stopTransitioning } = usePageTransition();

  function handleRouteChange(url: any, some: any) {
    console.log(
      `App is changing to ${url} ${
        some.shallow ? 'with' : 'without'
      } shallow routing`
    );
    console.log(some);
    startTransitioning(url);
    return;
  }

  function handleRouteComplete(url: any, { shallow }: { shallow: any }) {
    stopTransitioning();
    return;
  }

  useEffect(() => {
    router.events.on('routeChangeStart', handleRouteChange);
    router.events.on('routeChangeComplete', handleRouteComplete);

    return () => {
      router.events.off('routeChangeStart', handleRouteChange);
    };
  }, []);

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Head>
        <title>Quizio</title>
      </Head>
      <Layout>
        <Component {...pageProps} />
      </Layout>
    </ThemeProvider>
  );
}
