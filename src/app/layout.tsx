import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';
import { DataProvider } from '@/infrastructure/providers/data-provider';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'Elevates | Executive AI Decision Engine',
  description: 'High-end executive dashboard with AI-powered insights and glassmorphism design',
  keywords: ['dashboard', 'AI', 'analytics', 'executive', 'decision engine'],
  icons: {
    icon: '/icon.png',
    apple: '/apple-icon.png',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body
        className={`${geistSans.variable} ${geistMono.variable} font-sans antialiased`}
      >
        <DataProvider>{children}</DataProvider>
      </body>
    </html>
  );
}
