import '@/styles/globals.css';
import { CssBaseline, ThemeProvider } from '@mui/material';
import type { AppProps } from 'next/app';
import { createThemeWithMode } from '../theme';
import Layout from '../page-components/Layout';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { useEffect, useMemo, useState } from 'react';
import { usePageTransition } from '@/stores/page-transition.store';
import {
  DehydratedState,
  Hydrate,
  QueryClient,
  QueryClientProvider,
} from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { SessionProvider } from 'next-auth/react';
import { Session } from 'next-auth';
import { CacheProvider, EmotionCache } from '@emotion/react';
import createEmotionCache from '@/createEmotionCache';
import { Analytics } from '@vercel/analytics/react';
import { usePrefersLightMode } from '@/custom-hooks/usePrefersLightMode';

// Client-side cache, shared for the whole session of the user in the browser.
const clientSideEmotionCache = createEmotionCache();

export interface MyAppProps extends AppProps {
  emotionCache?: EmotionCache;
  pageProps: {
    session?: Session;
    dehydratedState?: DehydratedState;
  };
}

export default function App(props: MyAppProps) {
  const { Component, emotionCache = clientSideEmotionCache, pageProps } = props;
  const prefersLightMode = usePrefersLightMode();
  const theme = useMemo(
    () => createThemeWithMode(prefersLightMode ? 'light' : 'dark'),
    [prefersLightMode]
  );
  const [queryClient] = useState(() => new QueryClient());

  const router = useRouter();
  const { startTransitioning, stopTransitioning } = usePageTransition();

  useEffect(() => {
    function handleRouteChange(url: any, { shallow }: { shallow: boolean }) {
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
    <SessionProvider session={pageProps.session}>
      <QueryClientProvider client={queryClient}>
        <Hydrate state={pageProps.dehydratedState}>
          <CacheProvider value={emotionCache}>
            <ThemeProvider theme={theme}>
              <CssBaseline />
              <Head>
                <title>Quizio</title>
                <link
                  rel="dns-prefetch"
                  href={process.env.NEXT_PUBLIC_BACKEND_URL}
                />
                <link
                  rel="dns-prefetch"
                  href={process.env.NEXT_PUBLIC_GRAPHQL_URL}
                />
                <link
                  rel="preconnect"
                  href={process.env.NEXT_PUBLIC_BACKEND_URL}
                />
                <link
                  rel="preconnect"
                  href={process.env.NEXT_PUBLIC_GRAPHQL_URL}
                />
              </Head>
              <Layout>
                <Component {...pageProps} />
                <Analytics />
              </Layout>
            </ThemeProvider>
            <ReactQueryDevtools initialIsOpen={false} />
          </CacheProvider>
        </Hydrate>
      </QueryClientProvider>
    </SessionProvider>
  );
}
