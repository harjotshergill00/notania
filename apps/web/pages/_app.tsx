import type { AppProps } from 'next/app';
import Head from 'next/head';
import { Layout } from '@notania/ui';
import '../styles/globals.css';
import { ConsentBanner } from '@/components/ConsentBanner';
import { AnalyticsProvider } from '@/components/AnalyticsProvider';
import { UserMenu } from '@/components/UserMenu';

export default function NotaniaApp({ Component, pageProps }: AppProps) {
  return (
    <AnalyticsProvider>
      <Head>
        <title>Notania Arcade</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>
      <Layout actions={<UserMenu />}>
        <ConsentBanner />
        <Component {...pageProps} />
      </Layout>
    </AnalyticsProvider>
  );
}
