import '@/styles/globals.css';
import { CssBaseline, PaletteMode, ThemeProvider } from '@mui/material';
import type { AppProps } from 'next/app';
import Layout from '../page-components/Layout';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { usePageTransition } from '@/persistence/page-transition.store';
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
import { createThemeWithMode } from '@/theme';
import { ColorModeProvider } from '@/page-components/theme.context';
import { storageKeys } from '@/persistence/storage-keys';
import useStorage from '@/custom-hooks/useStorage';

// Client-side cache, shared for the whole session of the user in the browser.
const clientSideEmotionCache = createEmotionCache();

export interface MyAppProps extends AppProps {
  emotionCache?: EmotionCache;
  pageProps: {
    session?: Session;
    dehydratedState?: DehydratedState;
  };
}

const defaultColorMode: PaletteMode = 'dark';

export default function App(props: MyAppProps) {
  const { Component, emotionCache = clientSideEmotionCache, pageProps } = props;

  const [colorMode, setColorMode] = useStorage<PaletteMode>(
    storageKeys.theme,
    defaultColorMode
  );
  const theme = useMemo(() => createThemeWithMode(colorMode), [colorMode]);
  const toggleColorMode = useCallback(() => {
    setColorMode((prev) => (prev === 'dark' ? 'light' : 'dark'));
  }, [setColorMode]);

  const [queryClient] = useState(() => new QueryClient());

  const router = useRouter();
  const { startTransitioning, stopTransitioning } = usePageTransition();

  useEffect(() => {
    document.body.setAttribute('data-theme', colorMode);
  }, [colorMode]);

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
      router.events.off('routeChangeComplete', handleRouteComplete);
    };
  }, [router.events, startTransitioning, stopTransitioning]);

  return (
    <SessionProvider session={pageProps.session}>
      <QueryClientProvider client={queryClient}>
        <Hydrate state={pageProps.dehydratedState}>
          <CacheProvider value={emotionCache}>
            <ThemeProvider theme={theme}>
              <ColorModeProvider
                mode={colorMode}
                toggleColorMode={toggleColorMode}
              >
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
              </ColorModeProvider>
            </ThemeProvider>
            <ReactQueryDevtools initialIsOpen={false} />
          </CacheProvider>
        </Hydrate>
      </QueryClientProvider>
    </SessionProvider>
  );
}
