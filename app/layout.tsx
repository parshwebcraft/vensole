import './globals.css'
import type { Metadata } from 'next'
import { Inter, Merriweather } from 'next/font/google'
import { ThemeProvider } from '@/components/theme-provider'
import { AuthProvider } from '@/lib/supabase/auth-context'
import { Toaster } from '@/components/ui/sonner'
import { CustomCursor } from '@/components/custom-cursor'
import { PWARegister } from '@/components/pwa-register'
import { ScrollProgress } from '@/components/scroll-progress'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
})

const merriweather = Merriweather({
  subsets: ['latin'],
  variable: '--font-merriweather',
  weight: ['300', '400', '700', '900'],
})

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'https://vensoul.com'),
  title: {
    default: 'Vensoul - Stories, Writers and Paid Books from India',
    template: '%s | Vensoul',
  },
  description: 'Vensoul is an Indian storytelling platform for readers and writers across Rajasthan, Delhi, Uttar Pradesh and Maharashtra. Read the first chapter free, unlock full books, and discover original fiction.',
  keywords: [
    'Vensoul',
    'Indian storytelling platform',
    'read stories online India',
    'paid books platform',
    'free first chapter',
    'Rajasthan writers',
    'Delhi writers',
    'Uttar Pradesh writers',
    'Maharashtra writers',
    'Hindi stories',
    'English fiction India',
    'Wattpad alternative India',
  ],
  authors: [{ name: 'Vensoul' }],
  creator: 'Vensoul',
  publisher: 'Vensoul',
  category: 'books',
  applicationName: 'Vensoul',
  alternates: {
    canonical: '/',
  },
  manifest: '/manifest.json',
  themeColor: '#ea580c',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'Vensoul',
  },
  viewport: 'width=device-width, initial-scale=1, viewport-fit=cover',
  openGraph: {
    type: 'website',
    locale: 'en_IN',
    url: 'https://vensoul.com',
    siteName: 'Vensoul',
    title: 'Vensoul - Indian Stories, Writers and Paid Books | Product by ParshWebCraft',
    description: 'Discover original stories from Rajasthan, Delhi, Uttar Pradesh and Maharashtra. Read chapter 1 free and unlock full books on Vensoul.',
    images: [
      {
        url: 'https://images.pexels.com/photos/3184418/pexels-photo-3184418.jpeg',
        width: 1200,
        height: 630,
        alt: 'Vensoul social preview for Indian storytelling platform',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Vensoul - Indian Stories, Writers and Paid Books',
    description: 'Read chapter 1 free, unlock full books, and discover writers across Rajasthan, Delhi, Uttar Pradesh and Maharashtra.',
    images: ['https://images.pexels.com/photos/3184418/pexels-photo-3184418.jpeg'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-image-preview': 'large',
      'max-snippet': -1,
      'max-video-preview': -1,
    },
  },
  other: {
    'geo.region': 'IN',
    'geo.placename': 'Rajasthan, Delhi, Uttar Pradesh, Maharashtra',
    'business:contact_data:country_name': 'India',
  },
}

const structuredData = {
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  name: 'Vensoul',
  url: 'https://vensoul.com',
  description:
    'Indian storytelling platform for readers and writers across Rajasthan, Delhi, Uttar Pradesh and Maharashtra.',
  inLanguage: ['en-IN', 'hi-IN'],
  areaServed: [
    { '@type': 'State', name: 'Rajasthan' },
    { '@type': 'AdministrativeArea', name: 'Delhi' },
    { '@type': 'State', name: 'Uttar Pradesh' },
    { '@type': 'State', name: 'Maharashtra' },
  ],
  potentialAction: {
    '@type': 'SearchAction',
    target: 'https://vensoul.com/search?q={search_term_string}',
    'query-input': 'required name=search_term_string',
  },
  publisher: {
    '@type': 'Organization',
    name: 'Vensoul',
    url: 'https://vensoul.com',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning className="max-w-full overflow-x-hidden">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
        />
      </head>
      <body className={`${inter.variable} ${merriweather.variable} font-sans antialiased max-w-full overflow-x-hidden relative`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <AuthProvider>
            <ScrollProgress />
            <PWARegister />
            <CustomCursor />
            {children}
            <Toaster position="bottom-right" />
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
