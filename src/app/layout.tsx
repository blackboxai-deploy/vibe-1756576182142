import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'AI Image Editor - Free Image Editing for Everyone',
  description: 'Transform your images with AI-powered editing tools. Background removal, style transfer, image enhancement, and more - completely free!',
  keywords: 'AI image editor, free image editing, background removal, style transfer, image enhancement',
  authors: [{ name: 'AI Image Editor Team' }],
  openGraph: {
    title: 'AI Image Editor - Free AI-Powered Image Editing',
    description: 'Transform your images with AI-powered editing tools. No registration required!',
    type: 'website',
    url: 'https://your-domain.com',
    images: [
      {
        url: 'https://storage.googleapis.com/workspace-0f70711f-8b4e-4d94-86f1-2a93ccde5887/image/08a1c7f2-907f-4910-a5ad-e7b8b966e1ca.png',
        width: 1200,
        height: 630,
        alt: 'AI Image Editor - Free online image editing with AI',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'AI Image Editor - Free AI-Powered Image Editing',
    description: 'Transform your images with AI-powered editing tools. No registration required!',
    images: ['https://storage.googleapis.com/workspace-0f70711f-8b4e-4d94-86f1-2a93ccde5887/image/a31c2757-4d41-492e-b278-258cb4fb69db.png'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
    },
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="icon" href="/favicon.ico" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="theme-color" content="#000000" />
      </head>
      <body className={inter.className} suppressHydrationWarning>
        <div id="root">{children}</div>
      </body>
    </html>
  );
}