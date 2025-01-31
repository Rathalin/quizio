import '@/styles/globals.css';
import type { AppProps } from 'next/app';
import Layout from '../page-components/Layout';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { usePageTransition } from '@/persistence/page-transition.store';
import { SpeedInsights } from '@vercel/speed-insights/next';
import {
  DehydratedState,
  HydrationBoundary,
  MutationCache,
  QueryCache,
  QueryClient,
  QueryClientProvider,
} from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { SessionProvider } from 'next-auth/react';
import { Session } from 'next-auth';
import { Analytics } from '@vercel/analytics/react';
import { theme } from '@/theme';
import '@total-typescript/ts-reset';
import ToastSnackbar from '@/components/ToastSnackbar';
import { AppCacheProvider, DocumentHeadTags, DocumentHeadTagsProps } from '@mui/material-nextjs/v15-pagesRouter';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { SessionExpiredDialog } from '@/components/SessionExpiredDialog';
import { useSessionExpiredDialogStore } from '@/persistence/session-expired-dialog.store';
import { AbstractIntlMessages, NextIntlClientProvider } from 'next-intl';

export interface MyAppProps extends AppProps {
  pageProps: {
    session?: Session;
    dehydratedState?: DehydratedState;
    messages?: AbstractIntlMessages;
  };
}

export default function App(props: MyAppProps & DocumentHeadTagsProps) {
  const { Component, pageProps } = props;
  const { showSessionExpiredDialog: showSessionExpiredAlert } = useSessionExpiredDialogStore();
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            retry: 2,
          },
          mutations: {
            retry: 2,
          },
        },
        queryCache: new QueryCache({
          onError: (error) => {
            const err = error as unknown;
            if (typeof err === 'string' && err.trim() === 'token is expired') {
              // showErrorToast('Your session has expired!');
              showSessionExpiredAlert();
            }
          },
        }),
        mutationCache: new MutationCache({
          onError: (error) => {
            const err = error as unknown;
            if (typeof err === 'string' && err.trim() === 'token is expired') {
              // showErrorToast('Your session has expired!');
              showSessionExpiredAlert();
            }
          },
        }),
      }),
  );

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
      router.events.off('routeChangeComplete', handleRouteComplete);
    };
  }, [router.events, startTransitioning, stopTransitioning]);

  return (
    <SessionProvider session={pageProps.session}>
      <NextIntlClientProvider locale={router.locale} timeZone="Europe/Vienna" messages={pageProps.messages}>
        <QueryClientProvider client={queryClient}>
          <HydrationBoundary state={pageProps.dehydratedState}>
            <ThemeProvider theme={theme} defaultMode="dark">
              <CssBaseline />
              <AppCacheProvider {...props}>
                <Head>
                  <DocumentHeadTags {...props} />
                  <title>Quizio</title>
                  <link rel="dns-prefetch" href={process.env.NEXT_PUBLIC_BACKEND_URL} />
                  <link rel="dns-prefetch" href={process.env.NEXT_PUBLIC_GRAPHQL_URL} />
                  <link rel="preconnect" href={process.env.NEXT_PUBLIC_BACKEND_URL} />
                  <link rel="preconnect" href={process.env.NEXT_PUBLIC_GRAPHQL_URL} />
                </Head>
              </AppCacheProvider>

              <Layout>
                <Component {...pageProps} />
                <ToastSnackbar />
                <SessionExpiredDialog />
                <Analytics />
                <SpeedInsights />
              </Layout>
            </ThemeProvider>
            <ReactQueryDevtools initialIsOpen={false} />
          </HydrationBoundary>
        </QueryClientProvider>
      </NextIntlClientProvider>
    </SessionProvider>
  );
}
