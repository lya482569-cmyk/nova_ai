
import type { Metadata, Viewport } from 'next';
import './globals.css';
import { FirebaseClientProvider } from '@/firebase';
import { Toaster } from '@/components/ui/toaster';

export const metadata: Metadata = {
  title: 'Nova AI - الذكاء الاصطناعي المتقدم',
  description: 'Nova AI هو مساعدك الشخصي الذكي، يدعم اللغات المتعددة والأوامر الصوتية بتصميم عصري.',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'Nova AI',
  },
  other: {
    'mobile-web-app-capable': 'yes',
  }
};

export const viewport: Viewport = {
  themeColor: '#8A4DF2',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ar" dir="rtl" className="dark">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700&family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet" />
        <link rel="apple-touch-icon" href="https://images.unsplash.com/photo-1675249168121-160dc199e69e?q=80&w=1000&auto=format&fit=crop" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
      </head>
      <body className="font-body antialiased bg-background text-foreground selection:bg-primary/30 selection:text-primary overflow-x-hidden">
        <FirebaseClientProvider>
          {children}
          <Toaster />
        </FirebaseClientProvider>
      </body>
    </html>
  );
}
