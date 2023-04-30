import '@/styles/globals.css';
import { CssBaseline, ThemeProvider } from '@mui/material';
import type { AppProps } from 'next/app';
import { theme } from '../../theme';
import Layout from '../page-components/Layout';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { useEffect } from 'react';
import { usePageTransition } from '@/stores/page-transition.store';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';

export default function App({ Component, pageProps }: AppProps) {
  const queryClient = new QueryClient();

  const router = useRouter();
  const { startTransitioning, stopTransitioning } = usePageTransition();

  useEffect(() => {
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

    function handleRouteComplete() {
      stopTransitioning();
      return;
    }
    router.events.on('routeChangeStart', handleRouteChange);
    router.events.on('routeChangeComplete', handleRouteComplete);

    return () => {
      router.events.off('routeChangeStart', handleRouteChange);
    };
  }, [router.events, startTransitioning, stopTransitioning]);

  return (
    <ThemeProvider theme={theme}>
      <QueryClientProvider client={queryClient}>
        <CssBaseline />
        <Head>
          <title>Quizio</title>
        </Head>
        <Layout>
          <Component {...pageProps} />
        </Layout>
        <ReactQueryDevtools initialIsOpen={false} />
      </QueryClientProvider>
    </ThemeProvider>
  );
}
