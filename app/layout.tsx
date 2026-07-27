import './globals.css';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  metadataBase: new URL('https://vensoul.app'),
  title: 'VENSOUL — Write. Feel. Connect.',
  description: 'An emotional storytelling ecosystem where stories have souls. Read, write, and connect in the most beautiful literary universe.',
  openGraph: {
    title: 'VENSOUL — Write. Feel. Connect.',
    description: 'An emotional storytelling ecosystem where stories have souls.',
    images: [{ url: '/images/image.png' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'VENSOUL — Write. Feel. Connect.',
    images: [{ url: '/images/image.png' }],
  },
};

import { Toaster } from 'sonner';
import { AnalyticsTracker } from '@/components/analytics-tracker';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;0,600;0,700;1,300;1,400;1,500;1,600&family=Inter:wght@300;400;500;600&display=swap"
          rel="stylesheet"
        />
      </head>
      <body suppressHydrationWarning>
        {children}
        <Toaster position="bottom-center" />
        <AnalyticsTracker />
      </body>
    </html>
  );
}
